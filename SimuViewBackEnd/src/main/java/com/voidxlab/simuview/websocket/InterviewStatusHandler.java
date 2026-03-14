package com.voidxlab.simuview.websocket;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.voidxlab.simuview.dto.WsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InterviewStatusHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(InterviewStatusHandler.class);

    // 存储所有的在线连接，Key 为 view_id，Value 为 WebSocketSession
    private static final Map<String, WebSocketSession> SESSIONS = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 前端连接建立成功后触发
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String viewId = getViewIdFromSession(session);
        if (viewId != null) {
            SESSIONS.put(viewId, session);
            log.info("✅ WebSocket 连接成功，view_id: {}, 当前在线连接数: {}", viewId, SESSIONS.size());

            // 可以立刻给前端推一条连接成功的确认消息
            WsResponse response = new WsResponse("processing", "通道连接成功，等待数据解析...", null, null);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
        } else {
            log.warn("❌ WebSocket 连接缺少 view_id，将被关闭");
            session.close(CloseStatus.BAD_DATA);
        }
    }

    /**
     * 前端断开连接后触发
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String viewId = getViewIdFromSession(session);
        if (viewId != null) {
            SESSIONS.remove(viewId);
            log.info("🔌 WebSocket 断开连接，view_id: {}, 状态码: {}", viewId, status.getCode());
        }
    }

    /**
     * 业务方法：供其他 Service 调用，向指定的 view_id 推送消息
     */
    public void sendMessageToView(String viewId, WsResponse wsResponse) {
        WebSocketSession session = SESSIONS.get(viewId);
        if (session != null && session.isOpen()) {
            try {
                String jsonMessage = objectMapper.writeValueAsString(wsResponse);
                session.sendMessage(new TextMessage(jsonMessage));
            } catch (IOException e) {
                log.error("给 view_id: {} 发送 WebSocket 消息失败", viewId, e);
            }
        } else {
            log.warn("试图给 view_id: {} 发送消息，但客户端未连接或已断开", viewId);
        }
    }

    /**
     * 辅助方法：从 URL 路径中截取 view_id
     * 假设 URL 格式为: ws://domain/ws/v1/interview/task-status/{view_id}
     */
    private String getViewIdFromSession(WebSocketSession session) {
        try {
            String uri = session.getUri().toString();
            return uri.substring(uri.lastIndexOf('/') + 1);
        } catch (Exception e) {
            return null;
        }
    }
}
