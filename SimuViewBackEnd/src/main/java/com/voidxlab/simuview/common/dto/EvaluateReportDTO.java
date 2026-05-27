package com.voidxlab.simuview.common.dto;

import java.util.List;

public record EvaluateReportDTO(
    List<QuestionEvalDTO> questionEvaluations,
    int totalScore,
    String overallReport,
    List<String> strengths,
    List<String> weaknesses,
    DimensionScores dimensionScores,
    List<String> suggestions
) {
    public record QuestionEvalDTO(
        int questionIndex,
        String question,
        String userAnswer,
        int score,
        String feedback
    ) {}

    public record DimensionScores(
        int technicalDepth,
        int problemSolving,
        int communication,
        int logicalThinking,
        int experienceMatch,
        int learningPotential
    ) {}
}
