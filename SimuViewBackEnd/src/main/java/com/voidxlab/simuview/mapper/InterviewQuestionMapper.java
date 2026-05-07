package com.voidxlab.simuview.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.voidxlab.simuview.common.entity.InterviewQuestion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface InterviewQuestionMapper extends BaseMapper<InterviewQuestion> {

    @Select("SELECT * FROM interview_question WHERE session_id = #{sessionId} ORDER BY seq_number ASC")
    List<InterviewQuestion> findBySessionIdOrderBySeq(@Param("sessionId") Long sessionId);

    @Select("SELECT * FROM interview_question WHERE session_id = #{sessionId} AND status = 'PENDING' ORDER BY seq_number ASC LIMIT 1")
    InterviewQuestion findPendingBySessionId(@Param("sessionId") Long sessionId);

    @Select("SELECT COUNT(*) FROM interview_question WHERE session_id = #{sessionId}")
    int countBySessionId(@Param("sessionId") Long sessionId);

    @Select("SELECT * FROM interview_question WHERE session_id = #{sessionId} AND status = 'ANSWERED' ORDER BY seq_number DESC LIMIT 1")
    InterviewQuestion findLastAnsweredBySessionId(@Param("sessionId") Long sessionId);
}
