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
@TableName("interview_record")
public class InterviewRecord {
    @TableId(value = "interview_id", type = IdType.AUTO)
    private Long interviewId;
    @TableField("user_id")
    private Long userId;
    @TableField("jd_id")
    private Long jdId;
    @TableField("resume_id")
    private Long resumeId;
    @TableField("status")
    private Integer status;
    @TableField("start_time")
    private LocalDateTime startTime;
    @TableField("end_time")
    private LocalDateTime endTime;
}
