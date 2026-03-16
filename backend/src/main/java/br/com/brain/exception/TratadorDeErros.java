package br.com.brain.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(ErrosSistema.StorageException.class)
    public ResponseEntity<ApiError> handleStorage(ErrosSistema.StorageException ex, HttpServletRequest request) {
        log.error("Erro de Storage:", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of(
                        "STORAGE_ERROR",
                        "Falha ao salvar arquivo",
                        request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGlobalException(Exception ex, HttpServletRequest request) {
        log.error("Erro não tratado na aplicação:", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of(
                        "INTERNAL_SERVER_ERROR",
                        ex.getMessage() != null ? ex.getMessage() : "Erro interno do servidor",
                        request.getRequestURI(),
                        getStackTraceAsString(ex)));
    }

    private String getStackTraceAsString(Exception ex) {
        StringBuilder sb = new StringBuilder();
        StackTraceElement[] stackTrace = ex.getStackTrace();
        for (StackTraceElement element : stackTrace) {
            sb.append(String.format("%s.%s(%s:%d)%n",
                    element.getClassName(),
                    element.getMethodName(),
                    element.getFileName(),
                    element.getLineNumber()));
        }
        return sb.toString();
    }
}
