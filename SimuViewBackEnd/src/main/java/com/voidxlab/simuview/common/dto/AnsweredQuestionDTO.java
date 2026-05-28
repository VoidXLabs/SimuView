package com.voidxlab.simuview.common.dto;

import com.voidxlab.simuview.common.enums.QuestionStatus;

/**
 * 已回答的面试题目DTO，用于恢复历史记录
 */
public record AnsweredQuestionDTO(
        Long questionId,
        int seqNumber,
        String questionText,
        String questionType,
        String userAnswer,
        Integer score,
        String feedback,
        QuestionStatus status
) {}
