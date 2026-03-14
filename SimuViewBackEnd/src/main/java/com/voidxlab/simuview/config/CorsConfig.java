package com.voidxlab.simuview.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 允许跨域访问的路径
                .allowedOriginPatterns("*") // 允许跨域访问的源 (本地开发可以用 *，生产环境建议指定具体域名)
                .allowedMethods("POST", "GET", "PUT", "OPTIONS", "DELETE") // 允许请求方法
                .allowedHeaders("*") // 允许所有的请求 Header
                .allowCredentials(true) // 是否允许携带 cookie
                .maxAge(3600); // 预检请求的有效期，单位为秒
    }
}