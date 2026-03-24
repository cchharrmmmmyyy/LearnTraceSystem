package org.example.learntracebackend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoverDataRequest {
    @JsonProperty("session_id")
    private String sessionId;

    private List<HoverRecord> data;

    private String timestamp;
}
