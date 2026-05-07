package com.voidxlab.simuview.common.dto;

import com.voidxlab.simuview.common.enums.InterviewRecordStatus;

import java.util.List;

/**
 * 面试会话DTO
 */
public record InterviewSessionDTO(
    String sessionId,
    String resumeText,
    int totalQuestions,
    int currentQuestionIndex,
    List<InterviewQuestionDTO> questions,
    InterviewRecordStatus status
) {}
