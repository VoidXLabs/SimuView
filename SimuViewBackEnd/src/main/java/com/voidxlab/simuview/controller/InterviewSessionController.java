package com.voidxlab.simuview.controller;

import com.voidxlab.simuview.common.context.BaseContext;
import com.voidxlab.simuview.common.dto.CreateSessionRequest;
import com.voidxlab.simuview.common.dto.SubmitAnswerRequest;
import com.voidxlab.simuview.common.vo.Result;
import com.voidxlab.simuview.service.InterviewSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
public class InterviewSessionController {

    private final InterviewSessionService interviewSessionService;

    /**
     * Create a new interview session.
     * Returns immediately with sessionId, no AI call.
     * Frontend then connects to GET /sessions/{id}/stream to receive questions.
     */
    @PostMapping
    public Result<Map<String, Object>> createSession(@Valid @RequestBody CreateSessionRequest request) {
        Long userId = BaseContext.getUserId();
        int questionCount = request.questionCount() != null ? request.questionCount() : 5;
        Long sessionId = interviewSessionService.createSession(
                userId, request.jdId(), request.resumeId(), questionCount);
        return Result.success(Map.of(
                "sessionId", sessionId,
                "questionCount", questionCount,
                "status", "CREATED"
        ));
    }

    /**
     * SSE stream for interview questions.
     * Questions are generated one-at-a-time and streamed as SSE events.
     * The connection stays open for the entire interview duration.
     */
    @GetMapping(value = "/{id}/stream", produces = "text/event-stream;charset=utf-8")
    public SseEmitter streamQuestions(
            @PathVariable Long id,
            @RequestParam(required = false) Integer lastSeq) {
        return interviewSessionService.streamQuestions(id, lastSeq);
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
