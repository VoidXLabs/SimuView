package com.voidxlab.simuview.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.voidxlab.simuview.common.dto.InterviewRecordPageQueryDTO;
import com.voidxlab.simuview.common.entity.InterviewRecord;
import com.voidxlab.simuview.common.vo.Result;
import com.voidxlab.simuview.service.InterviewRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/interview-records")
@RequiredArgsConstructor
public class InterviewRecordController {

    private final InterviewRecordService interviewRecordService;
    @GetMapping("/page")
    public Result<Page<InterviewRecord>> page(@RequestBody InterviewRecordPageQueryDTO queryDTO){
        log.info("分页查询面试记录：{}", queryDTO);
        return Result.success(interviewRecordService.pageQuery(queryDTO));
    }
}
