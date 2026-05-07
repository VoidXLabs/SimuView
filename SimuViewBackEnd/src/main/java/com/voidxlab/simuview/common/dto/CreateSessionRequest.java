package com.voidxlab.simuview.common.dto;

import jakarta.validation.constraints.NotNull;

public record CreateSessionRequest(
    @NotNull Long jdId,
    @NotNull Long resumeId,
    Integer questionCount
) {
    public CreateSessionRequest {
        if (questionCount == null || questionCount < 1) {
            questionCount = 5;
        }
    }
}
