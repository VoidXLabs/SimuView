package com.voidxlab.simuview.controller;

import com.voidxlab.simuview.dto.WsResponse;
import com.voidxlab.simuview.websocket.InterviewStatusHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/preview/")
public class PreViewController {

    @Autowired
    private InterviewStatusHandler wsHandler;

    /**
     * 1. 模拟爬虫任务接口
     */
    @PostMapping("/job-parse")
    public Map<String, Object> mockJdScrape(@RequestBody Map<String, String> request) {
        String viewId = request.get("view_id");
        String jdUrl = request.get("url");

        // 立即异步执行爬虫任务
        executeJdScrapeTask(viewId, jdUrl);

        // 立即返回给前端
        Map<String, Object> res = new HashMap<>();
        res.put("code", 200);
        res.put("message", "爬虫任务已提交");
        return res;
    }

    /**
     * 2. 模拟简历解析任务接口
     */
    @PostMapping("/resume-parse")
    public Map<String, Object> mockResumeParse(
            @RequestParam("view_id") String viewId,
            @RequestParam("resume") MultipartFile file) {

        // 立即异步执行解析任务
        executeResumeParseTask(viewId, file.getOriginalFilename());

        // 立即返回给前端
        Map<String, Object> res = new HashMap<>();
        res.put("code", 200);
        res.put("message", "简历解析任务已提交");
        return res;
    }

    // --- 异步模拟逻辑 ---

    @Async
    public void executeJdScrapeTask(String viewId, String url) {
        try {
            // 阶段1：开始抓取
            wsHandler.sendMessageToView(viewId, new WsResponse("processing", "正在连接目标网站...", 1, null));
            Thread.sleep(2000); // 模拟网络延迟

            // 阶段2：解析中
            wsHandler.sendMessageToView(viewId, new WsResponse("processing", "正在提取岗位核心要素...", 1, null));
            Thread.sleep(3000); // 模拟解析耗时

            // 阶段3：成功
            Map<String, String> mockJdData = new HashMap<>();
            mockJdData.put("title", "Java开发工程师");
            mockJdData.put("company", "某互联网大厂");
            wsHandler.sendMessageToView(viewId, new WsResponse("success", "岗位信息抓取成功！", 1, mockJdData));

        } catch (InterruptedException e) {
            wsHandler.sendMessageToView(viewId, new WsResponse("error", "爬虫任务中断", 1, null));
        }
    }

    @Async
    public void executeResumeParseTask(String viewId, String fileName) {
        try {
            // 阶段1：上传成功
            wsHandler.sendMessageToView(viewId, new WsResponse("processing", "文件上传成功，等待OCR识别...", 2, null));
            Thread.sleep(1500);

            // 阶段2：OCR识别中
            wsHandler.sendMessageToView(viewId, new WsResponse("processing", "AI 正在理解简历内容...", 2, null));
            Thread.sleep(4000);

            // 阶段3：成功
            Map<String, Object> mockResumeData = new HashMap<>();
            mockResumeData.put("name", "张三");
            mockResumeData.put("experience", "3年");
            wsHandler.sendMessageToView(viewId, new WsResponse("success", "简历解析完成！", 2, mockResumeData));

        } catch (InterruptedException e) {
            wsHandler.sendMessageToView(viewId, new WsResponse("error", "简历解析失败", 2, null));
        }
    }
}
