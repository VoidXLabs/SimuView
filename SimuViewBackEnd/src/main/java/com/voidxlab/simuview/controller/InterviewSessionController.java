package com.voidxlab.simuview.controller;

import com.voidxlab.simuview.common.context.BaseContext;
import com.voidxlab.simuview.common.dto.CreateSessionRequest;
import com.voidxlab.simuview.common.dto.SubmitAnswerRequest;
import com.voidxlab.simuview.common.vo.Result;
import com.voidxlab.simuview.service.InterviewSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class InterviewSessionController {

    private final InterviewSessionService interviewSessionService;

    @Value("${simuview.interview.default-question-count:5}")
    private int defaultQuestionCount;

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
        Long sessionId = interviewSessionService.createSession(
                userId, request.jdId(), request.resumeId(), questionCount);
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
     * This is fast (no AI call) and triggers the SSE stream to continue.
     */
    @PostMapping("/{id}/answer")
    public Result<Void> submitAnswer(
            @PathVariable Long id,
            @Valid @RequestBody SubmitAnswerRequest request) {
        interviewSessionService.submitAnswer(request.questionId(), request.answer());
        return Result.success();
    }

    /**
     * Finish the interview and generate evaluation report via SSE stream.
     */
    @PostMapping(value = "/{id}/finish", produces = "text/event-stream;charset=utf-8")
    public SseEmitter finishInterview(@PathVariable Long id) {
        return interviewSessionService.finishInterview(id);
    }
}
