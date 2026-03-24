package org.example.learntracebackend.controller;

import org.example.learntracebackend.model.ApiResponse;
import org.example.learntracebackend.model.HoverDataRequest;
import org.example.learntracebackend.model.HoverRecord;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/hover-data")
public class HoverDataController {

    private final Map<String, List<HoverRecord>> hoverDataStore = new ConcurrentHashMap<>();

    @PostMapping
    public ApiResponse saveHoverData(@RequestBody HoverDataRequest request) {
        if (request.getSessionId() == null || request.getData() == null) {
            return ApiResponse.error(400, "Invalid request: sessionId and data are required");
        }

        String sessionId = request.getSessionId();
        List<HoverRecord> records = request.getData();

        hoverDataStore.computeIfAbsent(sessionId, k -> new ArrayList<>()).addAll(records);

        System.out.println("【悬停数据接收成功】session=" + sessionId + "，共 " + records.size() + " 条");

        Map<String, Object> result = new HashMap<>();
        result.put("id", "record_" + UUID.randomUUID().toString().substring(0, 8));

        return ApiResponse.success(result);
    }

    @GetMapping("/{sessionId}")
    public ApiResponse getHoverData(@PathVariable String sessionId) {
        List<HoverRecord> records = hoverDataStore.getOrDefault(sessionId, Collections.emptyList());

        Map<String, Object> result = new HashMap<>();
        result.put("session_id", sessionId);
        result.put("data", records);

        return ApiResponse.success(result);
    }

    @DeleteMapping("/{sessionId}")
    public ApiResponse deleteHoverData(@PathVariable String sessionId) {
        hoverDataStore.remove(sessionId);
        System.out.println("【悬停数据删除成功】session=" + sessionId);
        return ApiResponse.success(null);
    }
}
