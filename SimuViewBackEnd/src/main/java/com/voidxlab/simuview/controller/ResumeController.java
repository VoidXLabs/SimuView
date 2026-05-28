package com.voidxlab.simuview.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.voidxlab.simuview.common.context.BaseContext;
import com.voidxlab.simuview.common.dto.ResumePageQueryDTO;
import com.voidxlab.simuview.common.exception.BusinessException;
import com.voidxlab.simuview.common.vo.Result;
import com.voidxlab.simuview.common.entity.ResumeInformation;
import com.voidxlab.simuview.service.ResumeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    public Result<ResumeInformation> uploadResume(@RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            throw BusinessException.badRequest("请选择要上传的简历文件");
        }

        String contentType = file.getContentType();
        if (contentType != null && !contentType.contains("pdf") &&
                !contentType.contains("doc") && !contentType.contains("docx")) {
            throw BusinessException.badRequest("只支持PDF和Word格式的简历文件");
        }

        ResumeInformation resume = resumeService.uploadResume(file);
        return Result.success("简历上传成功", resume);
    }

    @PostMapping("/page")
    public Result<Page<ResumeInformation>> page(@RequestBody ResumePageQueryDTO queryDTO) {
        log.info("分页查询简历：{}", queryDTO);
        return Result.success(resumeService.pageQuery(queryDTO));
    }

    @GetMapping("/{resumeId}")
    public Result<ResumeInformation> getResume(@PathVariable String resumeId) {
        ResumeInformation resume = resumeService.getResumeById(resumeId);
        return Result.success("查询成功", resume);
    }

    @DeleteMapping("/{resumeId}")
    public Result<Void> deleteResume(@PathVariable String resumeId) {
        resumeService.deleteResume(resumeId);
        return Result.success();
    }
}