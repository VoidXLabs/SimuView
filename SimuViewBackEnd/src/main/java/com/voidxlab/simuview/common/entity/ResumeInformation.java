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
@TableName("resume_information")
public class ResumeInformation {

    @TableId(value = "resume_id", type = IdType.AUTO)
    private String resumeId;

    @TableField("user_id")
    private Long userId;

    @TableField("file_url")
    private String fileUrl;

    @TableField("parsed_content")
    private String paresedContent;

    @TableField("create_time")
    private LocalDateTime createTime;
}