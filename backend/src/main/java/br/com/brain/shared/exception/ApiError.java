package br.com.brain.shared.exception;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private final String code;
    private final String message;
    private final Instant timestamp;
    private final String path;
    private final List<String> details;

    public ApiError(String code, String message, String path) {
        this(code, message, path, null);
    }

    public ApiError(String code, String message, String path, List<String> details) {
        this.code = code;
        this.message = message;
        this.timestamp = Instant.now();
        this.path = path;
        this.details = details;
    }

    public static ApiError of(String code, String message, String path) {
        return new ApiError(code, message, path);
    }

    public static ApiError of(String code, String message, String path, List<String> details) {
        return new ApiError(code, message, path, details);
    }
}
