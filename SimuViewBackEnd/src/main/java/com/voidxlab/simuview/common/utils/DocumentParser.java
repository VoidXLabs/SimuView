package com.voidxlab.simuview.common.utils;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.config.TikaConfig;
import org.apache.tika.io.TikaInputStream;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Slf4j
public class DocumentParser {

    private static final Tika tika = new Tika();
    private static final TikaConfig tikaConfig;

    static {
        try {
            tikaConfig = TikaConfig.getDefaultConfig();
        } catch (Exception e) {
            log.error("初始化 Tika 配置失败", e);
            throw new RuntimeException("Tika 初始化失败", e);
        }
    }

    public static String extractText(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new RuntimeException("文件名不能为空");
        }

        long fileSize = file.getSize();
        if (fileSize > 10 * 1024 * 1024) {
            throw new RuntimeException("文件大小不能超过 10MB");
        }

        try {
            String mimeType = tika.detect(file.getInputStream());
            log.info("检测到文件类型: {}, 文件名: {}", mimeType, fileName);

            if (!isSupportedMimeType(mimeType)) {
                throw new RuntimeException("不支持的文件格式: " + mimeType);
            }

            return extractTextFromMultipartFile(file, mimeType);
        } catch (Exception e) {
            log.error("文档解析失败: {}", e.getMessage(), e);
            throw new RuntimeException("文档解析失败: " + e.getMessage());
        }
    }

    public static String extractText(InputStream file) {
        try {
            TikaInputStream tikaInputStream = TikaInputStream.get(file);
            String mimeType = tika.detect(tikaInputStream);
            log.info("检测到文件类型: {}", mimeType);

            if (!isSupportedMimeType(mimeType)) {
                throw new RuntimeException("不支持的文件格式: " + mimeType);
            }

            return extractTextFromInputStream(tikaInputStream, mimeType);
        } catch (Exception e) {
            log.error("文档解析失败: {}", e.getMessage(), e);
            throw new RuntimeException("文档解析失败: " + e.getMessage());
        }
    }


    private static String extractTextFromMultipartFile(MultipartFile file, String mimeType) throws Exception {
        BodyContentHandler handler = new BodyContentHandler(10 * 1024 * 1024);
        Metadata metadata = new Metadata();
        metadata.set(Metadata.CONTENT_TYPE, mimeType);

        try (TikaInputStream inputStream = TikaInputStream.get(file.getInputStream())) {
            AutoDetectParser parser = new AutoDetectParser(tikaConfig);
            parser.parse(inputStream, handler, metadata);
        }

        String content = handler.toString();

        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("未能从文档中提取到文本内容");
        }

        log.info("成功提取文本，长度: {} 字符,内容：{}", content.length(),content);
        return content;
    }

    private static String extractTextFromInputStream(TikaInputStream inputStream, String mimeType) throws Exception {
        BodyContentHandler handler = new BodyContentHandler(10 * 1024 * 1024);
        Metadata metadata = new Metadata();
        metadata.set(Metadata.CONTENT_TYPE, mimeType);

        try (inputStream) {
            AutoDetectParser parser = new AutoDetectParser(tikaConfig);
            parser.parse(inputStream, handler, metadata);
        }

        String content = handler.toString();

        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("未能从文档中提取到文本内容");
        }

        log.info("成功提取文本，长度: {} 字符", content.length());
        return content;
    }

    private static boolean isSupportedMimeType(String mimeType) {
        return mimeType != null && (
                mimeType.contains("pdf") ||
                        mimeType.contains("msword") ||
                        mimeType.contains("openxmlformats-officedocument.wordprocessingml") ||
                        mimeType.contains("text/plain") ||
                        mimeType.contains("rtf")
        );
    }
}
