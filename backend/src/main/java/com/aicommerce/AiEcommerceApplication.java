package com.aicommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * AI电商应用主类
 * 
 * 心理过程：
 * 1. 使用@SpringBootApplication简化配置
 * 2. 启用JPA审计功能自动处理创建时间、更新时间
 * 3. 为后续添加缓存、异步等功能预留扩展点
 */
@SpringBootApplication
@EnableJpaAuditing
public class AiEcommerceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiEcommerceApplication.class, args);
    }
}