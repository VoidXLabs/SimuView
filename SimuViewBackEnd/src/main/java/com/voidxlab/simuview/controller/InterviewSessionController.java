package com.voidxlab.simuview.controller;

import com.voidxlab.simuview.common.context.BaseContext;
import com.voidxlab.simuview.common.dto.CreateSessionRequest;
import com.voidxlab.simuview.common.dto.SubmitAnswerRequest;
import com.voidxlab.simuview.common.entity.EvaluationReport;
import com.voidxlab.simuview.common.entity.InterviewQuestion;
import com.voidxlab.simuview.common.enums.InterviewStyle;
import com.voidxlab.simuview.common.vo.Result;
import com.voidxlab.simuview.service.InterviewSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class InterviewSessionController {

    private final InterviewSessionService interviewSessionService;

    @Value("${simuview.interview.default-question-count}")
    private int defaultQuestionCount;
    @Value("${simuview.interview.default-interview-style}")
    private InterviewStyle defaultStyle;
    /**
     * Create a new interview session.
     * Returns immediately with sessionId, no AI call.
     * Frontend then connects to GET /sessions/{id}/stream to receive questions.
     */
    @PostMapping
    public Result<Map<String, Object>> createSession(@Valid @RequestBody CreateSessionRequest request) {
        Long userId = BaseContext.getUserId();
        int questionCount = request.questionCount() != null && request.questionCount() >= 1
                ? request.questionCount() : defaultQuestionCount;
        InterviewStyle style = request.style() != null
                ? request.style() : defaultStyle;
        Long sessionId = interviewSessionService.createSession(
                userId, request.jdId(), request.resumeId(), questionCount,style);
        return Result.success(Map.of(
                "sessionId", sessionId,
                "questionCount", questionCount,
                "status", "CREATED"
        ));
    }

    /**
     * SSE stream for the next interview question.
     * Backend determines which question to generate next.
     * Each question gets its own SSE connection — closes after streaming completes.
     */
    @GetMapping(value = "/{id}/questions/stream", produces = "text/event-stream;charset=utf-8")
    public SseEmitter streamNextQuestion(@PathVariable Long id) {
        return interviewSessionService.streamNextQuestion(id);
    }

    /**
     * Submit an answer for the current question.
     * If this is the last question, evaluation report is generated asynchronously.
     */
    @PostMapping("/{id}/answer")
    public Result<Void> submitAnswer(
            @PathVariable Long id,
            @Valid @RequestBody SubmitAnswerRequest request) {
        interviewSessionService.submitAnswer(request.questionId(), request.answer());
        return Result.success();
    }

    /**
     * Get answered question history for a session.
     * Returns already-answered questions with their answers, scores, and feedback.
     * Used for restoring chat history when user re-enters a session.
     */
    @GetMapping("/{id}/history")
    public Result<List<InterviewQuestion>> getSessionHistory(@PathVariable Long id) {
        return Result.success(interviewSessionService.getSessionHistory(id));
    }

    /**
     * Get interview session status.
     * Frontend polls this endpoint after submitting the last answer to check
     * if the async evaluation report has been generated.
     */
    @GetMapping("/{id}/status")
    public Result<Map<String, Object>> getSessionStatus(@PathVariable Long id) {
        return Result.success(interviewSessionService.getSessionStatus(id));
    }

    /**
     * Get the evaluation report for a completed session.
     * Only available when status is EVALUATED. Returns the full report JSON.
     */
    @GetMapping("/{id}/report")
    public Result<EvaluationReport> getReport(@PathVariable Long id) {
        return Result.success(interviewSessionService.getReport(id));
    }

    /**
     * Retry evaluation for a session that previously failed (status = EVALUATION_FAILED).
     */
    @PostMapping("/{id}/evaluate")
    public Result<Void> retryEvaluation(@PathVariable Long id) {
        interviewSessionService.retryEvaluation(id);
        return Result.success();
    }
}
