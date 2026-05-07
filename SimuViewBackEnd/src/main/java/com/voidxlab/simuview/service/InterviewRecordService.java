package com.voidxlab.simuview.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.voidxlab.simuview.common.context.BaseContext;
import com.voidxlab.simuview.common.dto.InterviewRecordPageQueryDTO;
import com.voidxlab.simuview.common.entity.InterviewRecord;
import com.voidxlab.simuview.mapper.InterviewRecordMapper;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewRecordService {
    private final InterviewRecordMapper InterviewRecordMapper;
    /**
     * 分页查询面试记录
     * @param queryDTO
     * @return
     */
    public Page<InterviewRecord> pageQuery(InterviewRecordPageQueryDTO queryDTO) {
        Long userId = BaseContext.getUserId();
        Integer pageNum = queryDTO.getPageNum();
        Integer pageSize = queryDTO.getPageSize();
        pageNum = pageNum == null ? 1 : pageNum;
        pageSize = pageSize == null ? 10 : pageSize;
        log.info("分页查询面试记录: userId={}, pageNum={}, pageSize={}", userId, pageNum, pageSize);

        Page<InterviewRecord> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<InterviewRecord> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(InterviewRecord::getUserId, userId)
                .orderByDesc(InterviewRecord::getStartTime);

        return InterviewRecordMapper.selectPage(page, queryWrapper);
    }
}
