package org.example.learntracebackend.service;

import org.example.learntracebackend.model.BehaviorAnalysisResult;
import org.example.learntracebackend.model.ReadingEvent;
import org.example.learntracebackend.model.RecognitionResult;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BehaviorService {

    private final Map<String, List<ReadingEvent>> sessionEvents = new ConcurrentHashMap<>();

    // 3.2.1 数据采集
    public void collectBehaviorData(String sessionId, List<ReadingEvent> events) {
        if (events == null || events.isEmpty()) return;
        sessionEvents.computeIfAbsent(sessionId, k -> new ArrayList<>()).addAll(events);
        System.out.println("【数据采集成功】session=" + sessionId + "，共 " + events.size() + " 条");
    }

    // 3.2.2 行为分析
    public BehaviorAnalysisResult analyzeBehavior(String sessionId, String correctAnswerSentenceId) {
        List<ReadingEvent> events = sessionEvents.getOrDefault(sessionId, Collections.emptyList());
        if (events.isEmpty()) {
            return new BehaviorAnalysisResult();
        }

        List<ReadingEvent> sorted = new ArrayList<>(events);
        sorted.sort(Comparator.comparingLong(ReadingEvent::getStartTime));

        long totalReadingTime = sorted.get(sorted.size() - 1).getStartTime() +
                sorted.get(sorted.size() - 1).getDuration() - sorted.get(0).getStartTime();

        Map<String, Long> sentenceDwell = new HashMap<>();
        Map<String, Long> paragraphDwell = new HashMap<>();
        Map<String, Long> wordDwell = new HashMap<>();

        for (ReadingEvent e : sorted) {
            if (!"hover".equals(e.getEventType())) continue;
            sentenceDwell.merge(e.getSentenceId(), e.getDuration(), Long::sum);
            paragraphDwell.merge(String.valueOf(e.getParagraphId()), e.getDuration(), Long::sum);
            wordDwell.merge(e.getWordId(), e.getDuration(), Long::sum);
        }

        List<String> readingPath = new ArrayList<>();
        int backReadCount = 0;
        String lastSentence = null;

        for (ReadingEvent e : sorted) {
            if (!"hover".equals(e.getEventType())) continue;
            String curr = e.getSentenceId();
            if (!curr.equals(lastSentence)) {
                readingPath.add(curr);
                lastSentence = curr;
            }
            if (lastSentence != null && compareSentenceIds(curr, lastSentence) < 0) {
                backReadCount++;
            }
        }

        String maxDwellSentence = null;
        long maxDwell = -1;
        for (Map.Entry<String, Long> entry : sentenceDwell.entrySet()) {
            if (entry.getValue() > maxDwell) {
                maxDwell = entry.getValue();
                maxDwellSentence = entry.getKey();
            }
        }

        boolean positioningAccurate = correctAnswerSentenceId != null &&
                correctAnswerSentenceId.equals(maxDwellSentence);

        BehaviorAnalysisResult result = new BehaviorAnalysisResult();
        result.setTotalReadingTime(totalReadingTime);
        result.setSentenceDwellTimes(sentenceDwell);
        result.setParagraphDwellTimes(paragraphDwell);
        result.setWordDwellTimes(wordDwell);
        result.setBackReadCount(backReadCount);
        result.setReadingPath(readingPath);
        result.setPositioningAccurate(positioningAccurate);
        result.setMaxDwellSentence(maxDwellSentence);
        return result;
    }

    private int compareSentenceIds(String id1, String id2) {
        try {
            String[] p1 = id1.split("-");
            String[] p2 = id2.split("-");
            int para1 = Integer.parseInt(p1[0]);
            int sent1 = Integer.parseInt(p1[1]);
            int para2 = Integer.parseInt(p2[0]);
            int sent2 = Integer.parseInt(p2[1]);
            if (para1 != para2) return Integer.compare(para1, para2);
            return Integer.compare(sent1, sent2);
        } catch (Exception e) {
            return id1.compareTo(id2);
        }
    }

    // 3.2.3 学习行为识别
    public RecognitionResult recognizeBehavior(BehaviorAnalysisResult analysis) {
        RecognitionResult result = new RecognitionResult();

        long timeMs = analysis.getTotalReadingTime();
        if (timeMs < 180000) result.setReadingEfficiency("high");
        else if (timeMs < 600000) result.setReadingEfficiency("medium");
        else result.setReadingEfficiency("low");

        List<String> habits = new ArrayList<>();
        habits.add("顺序阅读");
        if (analysis.getBackReadCount() == 0) habits.add("阅读顺序正确");
        result.setReadingHabits(habits);

        List<String> problems = new ArrayList<>();
        if (analysis.getBackReadCount() > 3) problems.add("频繁回读");
        if (!analysis.isPositioningAccurate()) problems.add("定位困难");
        if (analysis.getWordDwellTimes().size() > analysis.getSentenceDwellTimes().size() * 8) {
            problems.add("逐词阅读");
        }
        result.setIdentifiedProblems(problems);

        return result;
    }

    public RecognitionResult processBehavior(String sessionId, String correctAnswerSentenceId) {
        BehaviorAnalysisResult analysis = analyzeBehavior(sessionId, correctAnswerSentenceId);
        return recognizeBehavior(analysis);
    }
}
