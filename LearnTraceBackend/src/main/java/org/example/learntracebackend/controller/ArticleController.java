package org.example.learntracebackend.controller;

import org.example.learntracebackend.model.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ArticleController {

    @GetMapping("/articles/default")
    public ApiResponse getDefaultArticle() {
        List<String> sentences = Arrays.asList(
            "Reading is an essential skill that opens doors to knowledge and understanding.",
            "Practice makes perfect when it comes to improving reading speed and comprehension.",
            "The more you read, the better you become at understanding complex ideas.",
            "Focus and concentration are key to effective reading and learning.",
            "Set aside dedicated time each day for your reading practice.",
            "Track your progress to see how much you improve over time.",
            "Choose materials that interest you to maintain motivation.",
            "Take breaks when needed to avoid fatigue and maintain focus.",
            "Discuss what you read with others to deepen your understanding.",
            "Celebrate small victories on your journey to becoming a better reader."
        );

        return ApiResponse.success(sentences);
    }
}
