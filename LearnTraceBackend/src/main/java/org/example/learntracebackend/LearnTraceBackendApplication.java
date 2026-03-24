package org.example.learntracebackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LearnTraceBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LearnTraceBackendApplication.class, args);
        System.out.println("✅ LearnTrace 后端启动成功！访问 http://localhost:8080");
    }
}