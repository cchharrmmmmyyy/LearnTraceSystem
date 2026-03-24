package org.example.learntracebackend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoverRecord {
    @JsonProperty("event_type")
    private String eventType;

    @JsonProperty("paragraph_id")
    private int paragraphId;

    @JsonProperty("sentence_id")
    private String sentenceId;

    @JsonProperty("word_id")
    private String wordId;

    @JsonProperty("start_time")
    private long startTime;

    @JsonProperty("duration")
    private long duration;
}
