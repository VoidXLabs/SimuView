package com.voidxlab.simuview.common.util;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.PutObjectRequest;
import com.voidxlab.simuview.common.exception.BusinessException;
import com.voidxlab.simuview.config.OssConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileUploadUtil {

    private final OSS ossClient;
    private final OssConfig ossConfig;

    public String upload(MultipartFile file, String filePath) {
        validateFile(file);
        String sanitizedPath = sanitizeFilePath(filePath);
        
        try {
            PutObjectRequest request = new PutObjectRequest(ossConfig.getBucketName(), sanitizedPath, file.getInputStream());
            ossClient.putObject(request);
            log.info("文件上传成功: {}", sanitizedPath);
            return buildFileUrl(sanitizedPath);
        } catch (Exception e) {
            log.error("文件上传失败", e);
            throw BusinessException.error("文件上传失败: " + e.getMessage());
        }
    }

    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            throw BusinessException.badRequest("请提供文件URL");
        }
        
        try {
            String key = extractFilePath(fileUrl);
            ossClient.deleteObject(ossConfig.getBucketName(), key);
            log.info("文件删除成功: {}", fileUrl);
        } catch (Exception e) {
            log.error("文件删除失败", e);
            throw BusinessException.error("文件删除失败: " + e.getMessage());
        }
    }

    public void deleteByPrefix(String prefix) {
        if (prefix == null || prefix.isEmpty()) {
            throw BusinessException.badRequest("请提供文件前缀");
        }
        
        try {
            ossClient.listObjects(ossConfig.getBucketName(), prefix)
                    .getObjectSummaries().forEach(objectSummary -> {
                        ossClient.deleteObject(ossConfig.getBucketName(), objectSummary.getKey());
                        log.info("删除文件: {}", objectSummary.getKey());
                    });
        } catch (Exception e) {
            log.error("批量删除文件失败", e);
            throw BusinessException.error("批量删除文件失败: " + e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw BusinessException.badRequest("请选择要上传的文件");
        }
    }

    public String sanitizeFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "unnamed_file";
        }
        return filename.replaceAll("[\\\\/:*?\"<>|]", "_");
    }

    private String sanitizeFilePath(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            throw BusinessException.badRequest("文件路径不能为空");
        }
        return filePath.replaceAll("\\.\\.", "");
    }

    private String buildFileUrl(String filePath) {
        return String.format("https://%s.%s/%s", ossConfig.getBucketName(), ossConfig.getEndpoint(), filePath);
    }

    private String extractFilePath(String fileUrl) {
        String baseUrl = String.format("https://%s.%s/", ossConfig.getBucketName(), ossConfig.getEndpoint());
        return fileUrl.replace(baseUrl, "");
    }
}