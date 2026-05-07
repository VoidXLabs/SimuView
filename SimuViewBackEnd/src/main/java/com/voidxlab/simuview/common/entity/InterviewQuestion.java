package com.voidxlab.simuview.common.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.voidxlab.simuview.common.enums.QuestionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("interview_question")
public class InterviewQuestion {
    @TableId(value = "question_id", type = IdType.AUTO)
    private Long questionId;

    @TableField("session_id")
    private Long sessionId;

    @TableField("question_text")
    private String questionText;

    @TableField("question_type")
    private String questionType;

    @TableField("parent_question_id")
    private Long parentQuestionId;

    @TableField("seq_number")
    private Integer seqNumber;

    @TableField("user_answer")
    private String userAnswer;

    @TableField("score")
    private Integer score;

    @TableField("feedback")
    private String feedback;

    @TableField("status")
    private QuestionStatus status;

    @TableField("created_time")
    private LocalDateTime createdTime;

    @TableField("answered_time")
    private LocalDateTime answeredTime;
}
