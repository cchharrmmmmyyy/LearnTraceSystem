package org.example.learntracebackend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {
    private int code;
    private String message;
    private Object data;

    public static ApiResponse success(Object data) {
        return new ApiResponse(200, "success", data);
    }

    public static ApiResponse success(String message, Object data) {
        return new ApiResponse(200, message, data);
    }

    public static ApiResponse error(int code, String message) {
        return new ApiResponse(code, message, null);
    }
}
