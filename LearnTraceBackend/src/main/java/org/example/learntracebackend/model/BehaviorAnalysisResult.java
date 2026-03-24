package org.example.learntracebackend.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class BehaviorAnalysisResult {
    private long totalReadingTime;
    private Map<String, Long> sentenceDwellTimes = new HashMap<>();
    private Map<String, Long> paragraphDwellTimes = new HashMap<>();
    private Map<String, Long> wordDwellTimes = new HashMap<>();
    private int backReadCount;
    private List<String> readingPath = new ArrayList<>();
    private boolean positioningAccurate;
    private String maxDwellSentence;
}
