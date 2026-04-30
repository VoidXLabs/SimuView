package com.voidxlab.simuview.common.dto;

import lombok.Data;

@Data
public class InterviewRecordPageQueryDTO {
    Long userId;
    Integer pageNum;
    Integer pageSize;
}
