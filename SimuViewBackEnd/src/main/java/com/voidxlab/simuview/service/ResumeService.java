package com.voidxlab.simuview.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.voidxlab.simuview.common.context.BaseContext;
import com.voidxlab.simuview.common.entity.ResumeInformation;
import com.voidxlab.simuview.common.utils.DocumentParser;
import com.voidxlab.simuview.mapper.ResumeInformationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    public ResumeInformation uploadResume(MultipartFile file) {
        log.info("开始处理简历上传: userId={}, fileName={}", BaseContext.getUserId(), file.getOriginalFilename());

        String fileUrl = fileService.uploadResume(file);

        Long userId = BaseContext.getUserId();

        String content = parseResumeContent(file);

        ResumeInformation resume = ResumeInformation.builder()
                .userId(userId)
                .fileUrl(fileUrl)
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