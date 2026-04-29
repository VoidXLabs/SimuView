package com.voidxlab.simuview.common.dto;

/**
 * 面试问题DTO
 */
public record InterviewQuestionDTO(
        int questionIndex,
        String question,
        String userAnswer,
        Integer score,
        String feedback,
        boolean isFollowUp,
        Integer parentQuestionIndex
) {

    /**
     * 创建新问题（未回答状态）
     */
    public static InterviewQuestionDTO create(int index, String question) {
        return new InterviewQuestionDTO(index, question, null, null, null, false, null);
    }

    /**
     * 创建新问题（支持追问标记）
     */
    public static InterviewQuestionDTO create(
            int index,
            String question,
            boolean isFollowUp,
            Integer parentQuestionIndex) {
        return new InterviewQuestionDTO(index, question, null, null, null, isFollowUp, parentQuestionIndex);
    }

    /**
     * 添加用户回答
     */
    public InterviewQuestionDTO withAnswer(String answer) {
        return new InterviewQuestionDTO(
                questionIndex, question, answer, score, feedback, isFollowUp, parentQuestionIndex);
    }

    /**
     * 添加评分和反馈
     */
    public InterviewQuestionDTO withEvaluation(int score, String feedback) {
        return new InterviewQuestionDTO(
                questionIndex, question, userAnswer, score, feedback, isFollowUp, parentQuestionIndex);
    }
}
