package com.voidxlab.simuview.common.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("interview_evaluation")
public class EvaluationReport {
    @TableId(value = "report_id", type = IdType.AUTO)
    private Long reportId;

    @TableField("session_id")
    private Long sessionId;

    @TableField("report_json")
    private String reportJson;

    @TableField("created_time")
    private LocalDateTime createdTime;
}
