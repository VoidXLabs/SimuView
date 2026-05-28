package com.voidxlab.simuview.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.voidxlab.simuview.common.context.BaseContext;
import com.voidxlab.simuview.common.dto.ResumePageQueryDTO;
import com.voidxlab.simuview.common.entity.ResumeInformation;
import com.voidxlab.simuview.common.exception.BusinessException;
import com.voidxlab.simuview.common.exception.ErrorCode;
import com.voidxlab.simuview.common.utils.DocumentParser;
import com.voidxlab.simuview.mapper.ResumeInformationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final FileService fileService;
    private final ResumeInformationMapper resumeInformationMapper;

    @Value("${app.resume.max-upload-num}")
    private Integer MAX_UPLOAD_NUM;

    public Page<ResumeInformation> pageQuery(ResumePageQueryDTO queryDTO) {
        Long userId = BaseContext.getUserId();
        Integer pageNum = queryDTO.getPageNum();
        Integer pageSize = queryDTO.getPageSize();
        pageNum = pageNum == null ? 1 : pageNum;
        pageSize = pageSize == null ? 5 : pageSize;
        log.info("分页查询简历: userId={}, pageNum={}, pageSize={}", userId, pageNum, pageSize);

        Page<ResumeInformation> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<ResumeInformation> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ResumeInformation::getUserId, userId)
                .orderByDesc(ResumeInformation::getCreateTime);

        return resumeInformationMapper.selectPage(page, queryWrapper);
    }

    public ResumeInformation uploadResume(MultipartFile file) {
        Long userId = BaseContext.getUserId();
        log.info("开始处理简历上传: userId={}, fileName={}",userId , file.getOriginalFilename());

        List<ResumeInformation> resumeList = resumeInformationMapper.selectList(
                new LambdaQueryWrapper<ResumeInformation>()
                        .eq(ResumeInformation::getUserId, userId)
        );
        if (resumeList.size() >= MAX_UPLOAD_NUM) {
            throw new BusinessException(ErrorCode.RESUME_UPLOAD_NUM_LIMIT_EXCEEDED);
        }
        for(ResumeInformation resume : resumeList){
            if (resume.getFileName().equals(file.getOriginalFilename())) {
                throw new BusinessException(ErrorCode.RESUME_ALREADY_EXISTS);
            }
        }

        String fileUrl = fileService.uploadResume(file);


        String content = parseResumeContent(file);

        ResumeInformation resume = ResumeInformation.builder()
                .userId(userId)
                .fileUrl(fileUrl)
                .fileName(file.getOriginalFilename())
                .content(content)
                .createTime(LocalDateTime.now())
                .build();

        resumeInformationMapper.insert(resume);
        log.info("简历保存成功: resumeId={}", resume.getResumeId());

        return resume;
    }

    public ResumeInformation getResumeById(String resumeId) {
        ResumeInformation resume = resumeInformationMapper.selectById(resumeId);
        if (resume == null) {
            throw new RuntimeException("简历不存在: " + resumeId);
        }
        return resume;
    }

    public List<ResumeInformation> getResumesByUserId(Long userId) {
        LambdaQueryWrapper<ResumeInformation> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(ResumeInformation::getUserId, userId);
        return resumeInformationMapper.selectList(queryWrapper);
    }

    public void deleteResume(String resumeId) {
        ResumeInformation resume = getResumeById(resumeId);
        if(resume == null){
            throw new BusinessException(ErrorCode.RESUME_NOT_FOUND);
        }
        fileService.deleteResume(resume.getFileUrl());
        resumeInformationMapper.deleteById(resumeId);
        log.info("简历删除成功: resumeId={}", resumeId);
    }

    private String generateResumeId() {
        return "RES-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private String parseResumeContent(MultipartFile file) {
        try {
            String content = DocumentParser.extractText(file);
            log.info("简历解析完成，内容：{}", content);
            return content;
        } catch (Exception e) {
            log.error("解析简历失败: {}", e.getMessage());
            throw new RuntimeException("解析简历失败: " + e.getMessage());
        }
    }
}