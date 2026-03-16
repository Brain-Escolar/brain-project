package br.com.brain.exception;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private final String code;
    private final String message;
    private final Instant timestamp;
    private final String path;
    private final String stackTrace;

    public ApiError(String code, String message, String path) {
        this(code, message, path, null);
    }

    public ApiError(String code, String message, String path, String stackTrace) {
        this.code = code;
        this.message = message;
        this.timestamp = Instant.now();
        this.path = path;
        this.stackTrace = stackTrace;
    }

    public static ApiError of(String code, String message, String path) {
        return new ApiError(code, message, path);
    }

    public static ApiError of(String code, String message, String path, String stackTrace) {
        return new ApiError(code, message, path, stackTrace);
    }
}
