package com.voidxlab.simuview.common.dto;

import jakarta.validation.constraints.NotNull;

public record SubmitAnswerRequest(
    @NotNull Long questionId,
    @NotNull String answer
) {
}
