package com.voidxlab.simuview.common.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("jd_information")
public class JDInformation {
    @TableId(value = "jd_id", type = IdType.AUTO)
    private Long jdId;
    @TableField("title")
    private String title;
    @TableField("jd_url")
    private String jdUrl;
    @TableField("jd_content")
    private  String jdContent;
    @TableField("salary_range")
    private String salaryRange;
    @TableField("work_experience")
    private String workExperience;
    @TableField("education")
    private String education;
    @TableField("create_time")
    private String createTime;
}
