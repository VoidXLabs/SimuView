package com.voidxlab.simuview.service;

import com.voidxlab.simuview.common.ai.StructuredOutputInvoker;
import com.voidxlab.simuview.common.dto.EvaluateReportDTO;
import com.voidxlab.simuview.common.entity.InterviewQuestion;
import com.voidxlab.simuview.common.entity.InterviewRecord;
import com.voidxlab.simuview.common.entity.JDInformation;
import com.voidxlab.simuview.common.entity.ResumeInformation;
import com.voidxlab.simuview.common.enums.InterviewRecordStatus;
import com.voidxlab.simuview.common.enums.QuestionStatus;
import com.voidxlab.simuview.common.enums.QuestionType;
import com.voidxlab.simuview.common.exception.BusinessException;
import com.voidxlab.simuview.common.exception.ErrorCode;
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
import java.util.concurrent.ConcurrentHashMap;
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

    private final ConcurrentHashMap<Long, SseEmitter> sseEmitters = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, CompletableFuture<String>> answerTriggers = new ConcurrentHashMap<>();
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
     * Open a long-lived SSE stream for interview questions.
     * Questions are generated one-at-a-time via AI and streamed as SSE events.
     * After each question, the stream waits for the candidate's answer (via submitAnswer).
     */
    public SseEmitter streamQuestions(Long sessionId, Integer lastSeq) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout

        Runnable cleanup = () -> {
            sseEmitters.remove(sessionId);
            answerTriggers.remove(sessionId);
        };
        emitter.onCompletion(cleanup);
        emitter.onError(e -> cleanup.run());
        emitter.onTimeout(cleanup);

        sseEmitters.put(sessionId, emitter);

        sseExecutor.submit(() -> {
            try {
                generateQuestionsLoop(sessionId, emitter, lastSeq);
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
     * Submit an answer for a question. This triggers the SSE stream to continue
     * with the next question (follow-up or next main question).
     */
    public void submitAnswer(Long questionId, String answer) {
        InterviewQuestion question = interviewQuestionMapper.selectById(questionId);
        if (question == null) {
            throw new BusinessException(ErrorCode.INTERVIEW_QUESTION_NOT_FOUND);
        }

        question.setUserAnswer(answer);
        question.setStatus(QuestionStatus.ANSWERED.name());
        question.setAnsweredTime(LocalDateTime.now());
        interviewQuestionMapper.updateById(question);

        // Trigger SSE to continue
        CompletableFuture<String> future = answerTriggers.remove(question.getSessionId());
        if (future != null) {
            future.complete(answer);
        }
    }

    /**
     * Generate and stream the evaluation report via SSE.
     */
    public SseEmitter finishInterview(Long sessionId) {
        SseEmitter emitter = new SseEmitter(0L);

        sseExecutor.submit(() -> {
            try {
                // Send initial progress
                emitter.send(SseEmitter.event().name("eval.progress")
                        .data(Map.of("progress", 10, "phase", "正在分析面试记录...")));

                InterviewRecord record = interviewRecordMapper.selectById(sessionId);
                if (record == null) {
                    throw new BusinessException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND);
                }

                ResumeInformation resume = resumeInformationMapper.selectById(record.getResumeId());
                JDInformation jd = jdInformationMapper.selectById(record.getJdId());
                List<InterviewQuestion> questions = interviewQuestionMapper.findBySessionIdOrderBySeq(sessionId);

                // Update status
                record.setStatus(InterviewRecordStatus.COMPLETED);
                interviewRecordMapper.updateById(record);

                emitter.send(SseEmitter.event().name("eval.progress")
                        .data(Map.of("progress", 30, "phase", "正在生成评估报告...")));

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

                emitter.send(SseEmitter.event().name("eval.progress")
                        .data(Map.of("progress", 80, "phase", "报告生成完成")));

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

                // Update record status to EVALUATED
                record.setStatus(InterviewRecordStatus.EVALUATED);
                record.setEndTime(LocalDateTime.now());
                interviewRecordMapper.updateById(record);

                emitter.send(SseEmitter.event().name("eval.complete")
                        .data(Map.of("fullReport", report)));
                emitter.complete();

            } catch (Exception e) {
                log.error("Evaluation failed for session {}: {}", sessionId, e.getMessage());
                try {
                    int code = e instanceof BusinessException be
                            ? be.getCode() : ErrorCode.INTERVIEW_EVALUATION_FAILED.getCode();
                    emitter.send(SseEmitter.event().name("error")
                            .data(Map.of("code", code, "message", "生成评估报告失败: " + e.getMessage())));
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

    // ========== Private Methods ==========

    private void generateQuestionsLoop(Long sessionId, SseEmitter emitter, Integer lastSeq) throws Exception {
        InterviewRecord record = interviewRecordMapper.selectById(sessionId);
        if (record == null) {
            throw new BusinessException(ErrorCode.INTERVIEW_SESSION_NOT_FOUND);
        }

        ResumeInformation resume = resumeInformationMapper.selectById(record.getResumeId());
        JDInformation jd = jdInformationMapper.selectById(record.getJdId());

        List<InterviewQuestion> existingQuestions = interviewQuestionMapper.findBySessionIdOrderBySeq(sessionId);

        // Determine starting sequence number
        int startSeq = determineStartSeq(existingQuestions, lastSeq);
        int effectiveStartSeq = startSeq;

        // Check if there's a PENDING question to resend (on reconnection)
        InterviewQuestion pending = existingQuestions.stream()
                .filter(q -> q.getSeqNumber().equals(effectiveStartSeq) && QuestionStatus.PENDING.name().equals(q.getStatus()))
                .findFirst().orElse(null);

        if (pending != null) {
            // Resend existing question (non-streaming, text already in DB)
            resendQuestion(emitter, pending);
            updateRecordStatus(record, InterviewRecordStatus.IN_PROGRESS);
            waitForAnswer(sessionId, pending);
            startSeq = pending.getSeqNumber() + 1;
        }

        // Generate remaining questions
        for (int seq = startSeq; seq <= record.getTotalQuestions(); seq++) {
            // Build prompts
            Map<String, Object> params = buildPromptParams(record, resume, jd, sessionId);
            String systemPrompt = renderPrompt(singleQuestionSystemResource, params);
            String userPrompt = renderPrompt(singleQuestionUserResource, params);

            // Stream question from AI, token by token
            String cleanText = streamAndSaveQuestion(emitter, sessionId, seq, systemPrompt, userPrompt, existingQuestions);

            updateRecordStatus(record, InterviewRecordStatus.IN_PROGRESS);

            // If not last question, wait for answer
            if (seq < record.getTotalQuestions()) {
                // Find the question just saved (last one in list)
                InterviewQuestion currentQuestion = existingQuestions.get(existingQuestions.size() - 1);
                waitForAnswer(sessionId, currentQuestion);
            }
        }

        // All questions complete
        emitter.send(SseEmitter.event().name("interview.complete")
                .data(Map.of("totalQuestions", record.getTotalQuestions())));
        emitter.complete();
    }

    /**
     * Stream question from AI token by token, pushing each to SSE.
     * Returns the clean question text (with type prefix removed).
     */
    private String streamAndSaveQuestion(SseEmitter emitter, Long sessionId, int seq,
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

    private void waitForAnswer(Long sessionId, InterviewQuestion question) throws Exception {
        CompletableFuture<String> future = new CompletableFuture<>();
        answerTriggers.put(sessionId, future);

        future.get(30, TimeUnit.MINUTES);
        // Answer is already saved by submitAnswer, nothing more to do
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

    private int determineStartSeq(List<InterviewQuestion> existingQuestions, Integer lastSeq) {
        if (lastSeq != null) {
            return lastSeq + 1;
        }

        InterviewQuestion lastAnswered = existingQuestions.stream()
                .filter(q -> QuestionStatus.ANSWERED.name().equals(q.getStatus()))
                .max(Comparator.comparingInt(InterviewQuestion::getSeqNumber))
                .orElse(null);

        if (lastAnswered != null) {
            return lastAnswered.getSeqNumber() + 1;
        }

        return 1;
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
