package com.travelplanning.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Asynchronous execution configuration utilizing Java 21 Virtual Threads (Project Loom).
 * Allows executing concurrent third-party API calls (e.g. Gemini, SerpAPI) without exhausting OS threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Dedicated executor backed by lightweight Java 21 Virtual Threads.
     * Each asynchronous task runs on its own virtual thread.
     */
    @Bean(name = "virtualThreadExecutor")
    public Executor virtualThreadExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
