package org.example.learntracebackend.model;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class RecognitionResult {
    private String readingEfficiency;
    private List<String> readingHabits = new ArrayList<>();
    private List<String> identifiedProblems = new ArrayList<>();
}
