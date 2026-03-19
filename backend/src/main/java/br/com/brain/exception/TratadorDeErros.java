package br.com.brain.exception;

import java.util.List;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import br.com.brain.exception.ErrosSistema.DataInvalidaException;
import br.com.brain.exception.ErrosSistema.RecursoJaExisteException;
import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@RestControllerAdvice
public class TratadorDeErros {

    @ExceptionHandler(ErrosSistema.RecursoNaoEncontradoException.class)
    public ResponseEntity<ApiError> handleRecursoNaoEncontrado(ErrosSistema.RecursoNaoEncontradoException ex, HttpServletRequest request) {
        log.warn("Recurso não encontrado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiError.of("RECURSO_NAO_ENCONTRADO", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ErrosSistema.OperacaoInvalidaException.class)
    public ResponseEntity<ApiError> handleOperacaoInvalida(ErrosSistema.OperacaoInvalidaException ex, HttpServletRequest request) {
        log.warn("Operação inválida: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiError.of("OPERACAO_INVALIDA", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ErrosSistema.SessaoExpiradaException.class)
    public ResponseEntity<ApiError> handleSessaoExpirada(ErrosSistema.SessaoExpiradaException ex, HttpServletRequest request) {
        log.warn("Sessão expirada: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.of("SESSAO_EXPIRADA", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ErrosSistema.AcessoNegadoException.class)
    public ResponseEntity<ApiError> handleAcessoNegado(ErrosSistema.AcessoNegadoException ex, HttpServletRequest request) {
        log.warn("Acesso negado: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiError.of("ACESSO_NEGADO", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ErrosSistema.StorageException.class)
    public ResponseEntity<ApiError> handleStorage(ErrosSistema.StorageException ex, HttpServletRequest request) {
        log.error("Erro de storage: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of("STORAGE_ERROR", "Falha ao processar arquivo", request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidacao(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<String> erros = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .toList();
        log.warn("Erro de validação em {}: {}", request.getRequestURI(), erros);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of("VALIDACAO_INVALIDA", "Requisição contém campos inválidos", request.getRequestURI(), erros));
    }

    @ExceptionHandler(DataInvalidaException.class)
    public ResponseEntity<ApiError> handleDataInvalida(DataInvalidaException ex, HttpServletRequest request) {
        log.warn("Data inválida em {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of("DATA_INVALIDA", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(RecursoJaExisteException.class)
    public ResponseEntity<ApiError> handleRecursoJaExiste(RecursoJaExisteException ex, HttpServletRequest request) {
        log.warn("Recurso já existe em {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiError.of("RECURSO_JA_EXISTE", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ErrosSistema.SenhaIncorretaException.class)
    public ResponseEntity<ApiError> handleSenhaIncorreta(ErrosSistema.SenhaIncorretaException ex, HttpServletRequest request) {
        log.warn("Senha incorreta em {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.of("SENHA_INCORRETA", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ErrosSistema.TokenInvalidoOuExpiradoException.class)
    public ResponseEntity<ApiError> handleTokenInvalidoOuExpirado(ErrosSistema.TokenInvalidoOuExpiradoException ex, HttpServletRequest request) {
        log.warn("Token inválido ou expirado em {}: {}", request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.of("TOKEN_INVALIDO_OU_EXPIRADO", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(ErrosSistema.ErroInternoException.class)
    public ResponseEntity<ApiError> handleErroInterno(ErrosSistema.ErroInternoException ex, HttpServletRequest request) {
        log.error("Erro interno em {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of("ERRO_INTERNO", ex.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGlobal(Exception ex, HttpServletRequest request) {
        log.error("Erro não tratado na aplicação: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiError.of("INTERNAL_SERVER_ERROR", "Erro interno do servidor", request.getRequestURI()));
    }
}
