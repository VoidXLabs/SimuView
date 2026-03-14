package com.voidxlab.simuview.config;

import com.voidxlab.simuview.websocket.InterviewStatusHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final InterviewStatusHandler interviewStatusHandler;

    public WebSocketConfig(InterviewStatusHandler interviewStatusHandler) {
        this.interviewStatusHandler = interviewStatusHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(interviewStatusHandler, "/ws/v1/interview/task-status/*")
                .setAllowedOriginPatterns("*"); // 允许跨域，防止前端连接报 403 Forbidden
    }
}
