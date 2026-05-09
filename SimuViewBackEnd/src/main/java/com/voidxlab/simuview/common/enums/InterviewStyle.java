package com.voidxlab.simuview.common.enums;

import com.baomidou.mybatisplus.annotation.IEnum;

public enum InterviewStyle implements IEnum<Integer> {
    MILD(0),
    NORMAL(1),
    PRESSURE(2);

    private final int value;

    InterviewStyle(int value) {
        this.value = value;
    }

    @Override
    public Integer getValue() {
        return value;
    }
}
