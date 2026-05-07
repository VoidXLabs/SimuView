package com.voidxlab.simuview.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.voidxlab.simuview.common.entity.InterviewQuestion;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface InterviewQuestionMapper extends BaseMapper<InterviewQuestion> {

    @Select("SELECT * FROM interview_question WHERE session_id = #{sessionId} ORDER BY seq_number ASC")
    List<InterviewQuestion> findBySessionIdOrderBySeq(@Param("sessionId") Long sessionId);

    @Select("SELECT * FROM interview_question WHERE session_id = #{sessionId} AND status = 0 LIMIT 1")
    InterviewQuestion findPendingBySessionId(@Param("sessionId") Long sessionId);

}
