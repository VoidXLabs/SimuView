package com.voidxlab.simuview.interceptor;

import com.voidxlab.simuview.common.context.BaseContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Slf4j
@Component
public class LoginInterceptor implements HandlerInterceptor {

    private static final Long DEFAULT_USER_ID = 1L;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String userIdStr = request.getHeader("X-User-Id");
        
        Long userId;
        if (userIdStr != null && !userIdStr.isEmpty()) {
            try {
                userId = Long.parseLong(userIdStr);
                log.debug("从请求头获取用户ID: {}", userId);
            } catch (NumberFormatException e) {
                log.warn("用户ID格式错误，使用默认值: {}", DEFAULT_USER_ID);
                userId = DEFAULT_USER_ID;
            }
        } else {
            log.debug("未提供用户ID，使用默认值: {}", DEFAULT_USER_ID);
            userId = DEFAULT_USER_ID;
        }
        
        BaseContext.setUserId(userId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        BaseContext.removeUserId();
    }
}