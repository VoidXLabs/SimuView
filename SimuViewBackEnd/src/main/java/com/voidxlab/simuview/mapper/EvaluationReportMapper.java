package com.voidxlab.simuview.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.voidxlab.simuview.common.entity.EvaluationReport;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface EvaluationReportMapper extends BaseMapper<EvaluationReport> {

    @Select("SELECT * FROM evaluation_report WHERE session_id = #{sessionId} ORDER BY created_time DESC LIMIT 1")
    EvaluationReport findBySessionId(@Param("sessionId") Long sessionId);
}
