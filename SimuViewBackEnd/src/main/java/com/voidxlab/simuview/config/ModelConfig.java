package com.voidxlab.simuview.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class ModelConfig {

    @Bean
    public ChatClient resumeParserChatClient(OllamaChatModel ollamaChatModel) {
        return ChatClient
                .builder(ollamaChatModel)
                .defaultSystem("你是一个专业的简历解析助手，请将简历内容转换为结构化的JSON格式。")
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .build();
    }


}