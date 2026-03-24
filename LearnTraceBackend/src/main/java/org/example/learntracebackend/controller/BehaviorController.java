package org.example.learntracebackend.controller;

import org.example.learntracebackend.model.ApiResponse;
import org.example.learntracebackend.model.BehaviorAnalysisResult;
import org.example.learntracebackend.model.ReadingEvent;
import org.example.learntracebackend.model.RecognitionResult;
import org.example.learntracebackend.service.BehaviorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/behavior")
public class BehaviorController {

    private final BehaviorService behaviorService;

    public BehaviorController(BehaviorService behaviorService) {
        this.behaviorService = behaviorService;
    }

    // 3.2.1 数据采集
    @PostMapping("/collect")
    public ApiResponse collect(@RequestParam("sessionId") String sessionId,
                          @RequestBody List<ReadingEvent> events) {
        System.out.println("\n========== 收到前端数据 ==========");
        System.out.println("sessionId: " + sessionId);
        System.out.println("数据条数: " + events.size());
        if (!events.isEmpty()) {
            System.out.println("第一条数据: " + events.get(0));
        }
        System.out.println("==================================\n");

        behaviorService.collectBehaviorData(sessionId, events);
        return ApiResponse.success("行为数据采集成功！session=" + sessionId + "，共 " + events.size() + " 条");
    }

    // 3.2.2 行为分析
    @PostMapping("/analyze")
    public BehaviorAnalysisResult analyze(@RequestParam("sessionId") String sessionId,
                                          @RequestParam(value = "answerSentenceId", required = false) String answerSentenceId) {
        return behaviorService.analyzeBehavior(sessionId, answerSentenceId);
    }

    // 3.2.3 学习行为识别（最常用）
    @PostMapping("/recognize")
    public RecognitionResult recognize(@RequestParam("sessionId") String sessionId,
                                       @RequestParam(value = "answerSentenceId", required = false) String answerSentenceId) {
        return behaviorService.processBehavior(sessionId, answerSentenceId);
    }
}