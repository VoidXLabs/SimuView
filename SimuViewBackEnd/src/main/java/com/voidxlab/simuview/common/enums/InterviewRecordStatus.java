package com.voidxlab.simuview.common.enums;

import com.baomidou.mybatisplus.annotation.IEnum;

public enum InterviewRecordStatus implements IEnum<Integer> {
    CREATED(0),
    IN_PROGRESS(1),
    COMPLETED(2),
    EVALUATED(3);

    private final int value;

    InterviewRecordStatus(int value) {
        this.value = value;
    }

    @Override
    public Integer getValue() {
        return value;
    }
}
