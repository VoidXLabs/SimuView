package com.voidxlab.simuview.service;

import com.voidxlab.simuview.common.context.BaseContext;
import com.voidxlab.simuview.common.utils.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final FileUploadUtil fileUploadUtil;
    private static final String BASE_PATH = "interview";
    private static final String RESUME_PATH = "resume";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy_MM_dd");

    public String uploadResume(MultipartFile file) {
        Long userId = BaseContext.getUserId();
        log.info("开始上传简历: userId={}, fileName={}", userId, file.getOriginalFilename());
        
        String originalFilename = fileUploadUtil.sanitizeFilename(file.getOriginalFilename());
        String datePath = LocalDate.now().format(DATE_FORMATTER);
        String filePath = String.format("%s/%s/%s/%s/%s", BASE_PATH, userId, RESUME_PATH, datePath, originalFilename);
        
        return fileUploadUtil.upload(file, filePath);
    }


}