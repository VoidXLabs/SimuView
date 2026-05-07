package com.voidxlab.simuview.service;

import com.voidxlab.simuview.common.ai.StructuredOutputInvoker;
import com.voidxlab.simuview.common.dto.EvaluateReportDTO;
import com.voidxlab.simuview.common.entity.EvaluationReport;
import com.voidxlab.simuview.common.entity.InterviewQuestion;
import com.voidxlab.simuview.common.entity.InterviewRecord;
import com.voidxlab.simuview.common.entity.JDInformation;
import com.voidxlab.simuview.common.entity.ResumeInformation;
import com.voidxlab.simuview.common.enums.InterviewRecordStatus;
import com.voidxlab.simuview.common.enums.QuestionStatus;
import com.voidxlab.simuview.common.enums.QuestionType;
import com.voidxlab.simuview.common.exception.BusinessException;
import com.voidxlab.simuview.common.exception.ErrorCode;
import com.voidxlab.simuview.mapper.EvaluationReportMapper;
import com.voidxlab.simuview.mapper.InterviewQuestionMapper;
import com.voidxlab.simuview.mapper.InterviewRecordMapper;
import com.voidxlab.simuview.mapper.JDInformationMapper;
import com.voidxlab.simuview.mapper.ResumeInformationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewSessionService {

    private final InterviewRecordMapper interviewRecordMapper;
    private final InterviewQuestionMapper interviewQuestionMapper;
    private final ResumeInformationMapper resumeInformationMapper;
    private final JDInformationMapper jdInformationMapper;
    private final StructuredOutputInvoker structuredOutputInvoker;
    private final ChatClient chatClient;
    private final EvaluationReportMapper evaluationReportMapper;

    private final ExecutorService sseExecutor = Executors.newVirtualThreadPerTaskExecutor();

    @Value("classpath:prompts/single-question-system.st")
    private Resource singleQuestionSystemResource;

    @Value("classpath:prompts/single-question-user.st")
    private Resource singleQuestionUserResource;

    @Value("classpath:prompts/evaluation-system.st")
    private Resource evaluationSystemResource;

    @Value("classpath:prompts/evaluation-user.st")
    private Resource evaluationUserResource;

    /**
     * Create a new interview session (instant, no AI call).
     */
    public Long createSession(Long userId, Long jdId, Long resumeId, int questionCount) {
        InterviewRecord record = InterviewRecord.builder()
                .userId(userId)
                .jdId(jdId)
                .resumeId(resumeId)
                .totalQuestions(questionCount)
                .status(InterviewRecordStatus.CREATED)
                .startTime(LocalDateTime.now())
                .build();
        interviewRecordMapper.insert(record);
        return record.getInterviewId();
    }

    /**
     * Open an SSE connection to stream the next unanswered question.
     * Backend determines which question to generate based on session state.
     * Each question gets its own SSE connection — closes after streaming completes.
     */
    public SseEmitter streamNextQuestion(Long sessionId) {
        SseEmitter emitter = new SseEmitter(0L);

        sseExecutor.submit(() -> {
            try {
                InterviewRecord record = interviewRecordMapper.selectById(sessionId);
                if (record == null) {
                    throw new BusinessException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND);
                }

                List<InterviewQuestion> existingQuestions = interviewQuestionMapper.findBySessionIdOrderBySeq(sessionId);

                // 1) Check for PENDING question → resend on reconnect
                InterviewQuestion pending = existingQuestions.stream()
                        .filter(q -> QuestionStatus.PENDING.name().equals(q.getStatus()))
                        .findFirst().orElse(null);
                if (pending != null) {
                    resendQuestion(emitter, pending);
                    updateRecordStatus(record, InterviewRecordStatus.IN_PROGRESS);
                    emitter.complete();
                    return;
                }

                // 2) Check if all questions completed
                long answeredCount = existingQuestions.stream()
                        .filter(q -> QuestionStatus.ANSWERED.name().equals(q.getStatus())
                                || QuestionStatus.SCORED.name().equals(q.getStatus()))
                        .count();
                if (answeredCount >= record.getTotalQuestions()) {
                    emitter.send(SseEmitter.event().name("interview.complete")
                            .data(Map.of("totalQuestions", record.getTotalQuestions())));
                    emitter.complete();
                    return;
                }

                // 3) Generate the next question
                int nextSeq = (int) answeredCount + 1;
                boolean isLast = nextSeq >= record.getTotalQuestions();

                ResumeInformation resume = resumeInformationMapper.selectById(record.getResumeId());
                JDInformation jd = jdInformationMapper.selectById(record.getJdId());

                Map<String, Object> params = buildPromptParams(record, resume, jd, sessionId);
                String systemPrompt = renderPrompt(singleQuestionSystemResource, params);
                String userPrompt = renderPrompt(singleQuestionUserResource, params);

                streamAndSaveQuestion(emitter, sessionId, nextSeq, isLast, systemPrompt, userPrompt, existingQuestions);

                updateRecordStatus(record, InterviewRecordStatus.IN_PROGRESS);

                emitter.complete();

            } catch (Exception e) {
                log.error("SSE stream error for session {}: {}", sessionId, e.getMessage());
                try {
                    int code = e instanceof BusinessException be
                            ? be.getCode() : ErrorCode.INTERVIEW_QUESTION_GENERATION_FAILED.getCode();
                    Map<String, Object> errorData = new HashMap<>();
                    errorData.put("code", code);
                    errorData.put("message", "生成面试题目失败: " + e.getMessage());
                    emitter.send(SseEmitter.event().name("error").data(errorData));
                } catch (Exception ignored) {
                }
                try {
                    emitter.completeWithError(e);
                } catch (Exception ignored) {
                }
            }
        });

        return emitter;
    }
    
    /**
     * Submit an answer for a question.
     * If this is the last question, triggers async evaluation report generation.
     */
    public void submitAnswer(Long questionId, String answer) {
        InterviewQuestion question = interviewQuestionMapper.selectById(questionId);
        if (question == null) {
            throw new BusinessException(ErrorCode.INTERVIEW_QUESTION_NOT_FOUND);
        }
        if (!question.getStatus().equals(QuestionStatus.PENDING.name())) {
            throw new BusinessException(ErrorCode.INTERVIEW_QUESTION_ALREADY_ANSWERED);
        }

        question.setUserAnswer(answer);
        question.setStatus(QuestionStatus.ANSWERED.name());
        question.setAnsweredTime(LocalDateTime.now());
        interviewQuestionMapper.updateById(question);

        // Check if all questions answered → trigger async evaluation

        InterviewRecord record = interviewRecordMapper.selectById(question.getSessionId());
        long answeredCount = question.getSeqNumber();
        if (answeredCount >= record.getTotalQuestions()) {
            record.setStatus(InterviewRecordStatus.COMPLETED);
            record.setEndTime(LocalDateTime.now());
            interviewRecordMapper.updateById(record);

            // Async evaluation
            sseExecutor.submit(() -> evaluateSession(question.getSessionId()));
        }
    }

    /**
     * Get session status. Frontend polls this after submitting the last answer.
     */
    public Map<String, Object> getSessionStatus(Long sessionId) {
        InterviewRecord record = interviewRecordMapper.selectById(sessionId);
        if (record == null) {
            throw new BusinessException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("sessionId", sessionId);
        result.put("status", record.getStatus());
        return result;
    }

    /**
     * Get the evaluation report for a session (only available when status is EVALUATED).
     */
    public EvaluationReport getReport(Long sessionId) {
        InterviewRecord record = interviewRecordMapper.selectById(sessionId);
        if (record == null) {
            throw new BusinessException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND);
        }
        if (record.getStatus() != InterviewRecordStatus.EVALUATED) {
            throw new BusinessException(ErrorCode.INTERVIEW_NOT_COMPLETED);
        }
        EvaluationReport report = evaluationReportMapper.findBySessionId(sessionId);
        if (report == null) {
            throw new BusinessException(ErrorCode.INTERVIEW_EVALUATION_FAILED);
        }
        return report;
    }

    /**
     * Evaluate a completed session and store results in DB.
     */
    private void evaluateSession(Long sessionId) {
        try {
            log.info("开始异步评估，sessionId: {}", sessionId);

            InterviewRecord record = interviewRecordMapper.selectById(sessionId);
            ResumeInformation resume = resumeInformationMapper.selectById(record.getResumeId());
            JDInformation jd = jdInformationMapper.selectById(record.getJdId());
            List<InterviewQuestion> questions = interviewQuestionMapper.findBySessionIdOrderBySeq(sessionId);

            // Build prompt
            Map<String, Object> params = new HashMap<>();
            params.put("qaHistory", formatFullQaHistory(questions));
            params.put("resumeText", resume != null ? resume.getContent() : "");
            params.put("jdContent", jd != null ? jd.getJdContent() : "");

            String systemPrompt = renderPrompt(evaluationSystemResource, params);
            String userPrompt = renderPrompt(evaluationUserResource, params);

            // Call AI for evaluation
            BeanOutputConverter<EvaluateReportDTO> converter = new BeanOutputConverter<>(EvaluateReportDTO.class);
            String systemPromptWithFormat = systemPrompt + "\n" + converter.getFormat();

            EvaluateReportDTO report = structuredOutputInvoker.invoke(
                    systemPromptWithFormat,
                    userPrompt,
                    converter,
                    ErrorCode.AI_SERVICE_UNAVAILABLE,
                    "评估报告生成"
            );

            // Update questions with scores
            if (report.questionEvaluations() != null) {
                for (var qEval : report.questionEvaluations()) {
                    InterviewQuestion q = questions.stream()
                            .filter(x -> x.getSeqNumber().equals(qEval.questionIndex()))
                            .findFirst().orElse(null);
                    if (q != null) {
                        q.setScore(qEval.score());
                        q.setFeedback(qEval.feedback());
                        q.setStatus(QuestionStatus.SCORED.name());
                        interviewQuestionMapper.updateById(q);
                    }
                }
            }

            // Store report in evaluation_report table and update record status
            String reportJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(report);
            EvaluationReport evaluationReport = EvaluationReport.builder()
                    .sessionId(sessionId)
                    .reportJson(reportJson)
                    .createdTime(LocalDateTime.now())
                    .build();
            evaluationReportMapper.insert(evaluationReport);

            record.setStatus(InterviewRecordStatus.EVALUATED);
            interviewRecordMapper.updateById(record);

            log.info("异步评估完成，sessionId: {}", sessionId);

        } catch (Exception e) {
            log.error("异步评估失败，sessionId: {}: {}", sessionId, e.getMessage(), e);
        }
    }

    // ========== Private Methods ==========

    /**
     * Stream question from AI token by token, pushing each to SSE.
     * Returns the clean question text (with type prefix removed).
     */
    private String streamAndSaveQuestion(SseEmitter emitter, Long sessionId, int seq, boolean isLast,
                                          String systemPrompt, String userPrompt,
                                          List<InterviewQuestion> existingQuestions) throws Exception {
        // Send question.start
        emitter.send(SseEmitter.event().name("question.start")
                .data(Map.of("seqNumber", seq)));

        // Stream from AI
        var flux = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .stream()
                .content();

        // Bridge reactive Flux to imperative SSE thread
        CompletableFuture<String> streamCompletion = new CompletableFuture<>();
        StringBuilder fullText = new StringBuilder();

        flux.subscribe(
                token -> {
                    fullText.append(token);
                    try {
                        emitter.send(SseEmitter.event().name("question.token")
                                .data(Map.of("token", token)));
                    } catch (IOException e) {
                        streamCompletion.completeExceptionally(
                                new RuntimeException("SSE send failed during streaming", e));
                    }
                },
                streamCompletion::completeExceptionally,
                () -> streamCompletion.complete(fullText.toString())
        );

        // Block SSE thread until AI stream completes
        String rawText = streamCompletion.get(5, TimeUnit.MINUTES);

        // Parse type prefix from the raw text
        QuestionType questionType = QuestionType.MAIN;
        String cleanText = rawText;
        if (rawText.startsWith("[FOLLOW_UP]")) {
            questionType = QuestionType.FOLLOW_UP;
            cleanText = rawText.substring("[FOLLOW_UP]".length()).trim();
        } else if (rawText.startsWith("[MAIN]")) {
            cleanText = rawText.substring("[MAIN]".length()).trim();
        }

        // Save to DB
        Long parentId = findLastMainQuestionId(existingQuestions);
        InterviewQuestion question = InterviewQuestion.builder()
                .sessionId(sessionId)
                .questionText(cleanText)
                .questionType(questionType.name())
                .seqNumber(seq)
                .parentQuestionId(questionType == QuestionType.FOLLOW_UP ? parentId : null)
                .status(QuestionStatus.PENDING.name())
                .createdTime(LocalDateTime.now())
                .build();
        interviewQuestionMapper.insert(question);
        existingQuestions.add(question);

        // Send question.end
        Map<String, Object> endData = new HashMap<>();
        endData.put("questionId", question.getQuestionId());
        endData.put("fullText", cleanText);
        endData.put("type", questionType.name());
        endData.put("isLast", isLast);
        emitter.send(SseEmitter.event().name("question.end").data(endData));

        return cleanText;
    }

    private void resendQuestion(SseEmitter emitter, InterviewQuestion question) throws IOException {
        Map<String, Object> startData = new HashMap<>();
        startData.put("questionId", question.getQuestionId());
        startData.put("type", question.getQuestionType());
        startData.put("seqNumber", question.getSeqNumber());
        emitter.send(SseEmitter.event().name("question.start").data(startData));

        emitter.send(SseEmitter.event().name("question.token")
                .data(Map.of("token", question.getQuestionText())));

        Map<String, Object> endData = new HashMap<>();
        endData.put("questionId", question.getQuestionId());
        endData.put("fullText", question.getQuestionText());
        endData.put("type", question.getQuestionType());
        emitter.send(SseEmitter.event().name("question.end").data(endData));
    }

    private Map<String, Object> buildPromptParams(InterviewRecord record, ResumeInformation resume,
                                                   JDInformation jd, Long sessionId) {
        List<InterviewQuestion> history = interviewQuestionMapper.findBySessionIdOrderBySeq(sessionId);
        int answeredCount = (int) history.stream()
                .filter(q -> QuestionStatus.ANSWERED.name().equals(q.getStatus()))
                .count();

        Map<String, Object> params = new HashMap<>();
        params.put("resumeText", resume != null ? resume.getContent() : "");
        params.put("jdContent", jd != null ? jd.getJdContent() : "");
        params.put("qaHistory", formatQaHistory(history));
        params.put("answeredCount", answeredCount);
        params.put("totalCount", record.getTotalQuestions());
        return params;
    }

    private Long findLastMainQuestionId(List<InterviewQuestion> questions) {
        if (questions.isEmpty()) return null;
        InterviewQuestion lastMain = questions.stream()
                .filter(q -> QuestionType.MAIN.name().equals(q.getQuestionType()) && q.getQuestionId() != null)
                .reduce((first, second) -> second)
                .orElse(null);
        return lastMain != null ? lastMain.getQuestionId() : null;
    }

    private String formatQaHistory(List<InterviewQuestion> questions) {
        if (questions == null || questions.isEmpty()) {
            return "暂无";
        }
        return questions.stream()
                .map(q -> String.format("问题%d (%s): %s\n回答: %s",
                        q.getSeqNumber(),
                        q.getQuestionType(),
                        q.getQuestionText(),
                        q.getUserAnswer() != null ? q.getUserAnswer() : "待回答"))
                .collect(Collectors.joining("\n---\n"));
    }

    private String formatFullQaHistory(List<InterviewQuestion> questions) {
        if (questions == null || questions.isEmpty()) {
            return "暂无面试记录";
        }
        return questions.stream()
                .map(q -> String.format("【第%d题 %s】\n面试官: %s\n候选人: %s",
                        q.getSeqNumber(),
                        q.getQuestionType(),
                        q.getQuestionText(),
                        q.getUserAnswer() != null ? q.getUserAnswer() : "未回答"))
                .collect(Collectors.joining("\n\n"));
    }

    private String renderPrompt(Resource resource, Map<String, Object> params) {
        try (InputStream is = resource.getInputStream()) {
            String template = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return new PromptTemplate(template).render(params);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "加载提示词模板失败: " + resource.getFilename());
        }
    }

    private void updateRecordStatus(InterviewRecord record, InterviewRecordStatus status) {
        if (record.getStatus() != status) {
            record.setStatus(status);
            interviewRecordMapper.updateById(record);
        }
    }
}
