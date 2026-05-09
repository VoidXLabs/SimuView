package com.voidxlab.simuview.common.dto;

import com.voidxlab.simuview.common.enums.InterviewStyle;
import jakarta.validation.constraints.NotNull;

public record CreateSessionRequest(
    @NotNull Long jdId,
    @NotNull Long resumeId,
    InterviewStyle style,
    Integer questionCount
) {}
