package com.voidxlab.simuview.common.dto;

import jakarta.validation.constraints.NotNull;

public record CreateSessionRequest(
    @NotNull Long jdId,
    @NotNull Long resumeId,
    Integer questionCount
) {}
