package br.com.brain.shared.exception;

public final class ErrosSistema {
    private ErrosSistema() {
    }

    public static class StorageException extends RuntimeException {
        public StorageException(String message) {
            super(message);
        }

        public StorageException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class RecursoNaoEncontradoException extends RuntimeException {
        public RecursoNaoEncontradoException(String message) {
            super(message);
        }

        public static RecursoNaoEncontradoException para(String entidade) {
            return new RecursoNaoEncontradoException(entidade + " não encontrado(a)");
        }

        public static RecursoNaoEncontradoException para(String entidade, Object id) {
            return new RecursoNaoEncontradoException(entidade + " não encontrado(a) com id: " + id);
        }
    }

    public static class OperacaoInvalidaException extends RuntimeException {
        public OperacaoInvalidaException(String message) {
            super(message);
        }

        public static OperacaoInvalidaException com(String motivo) {
            return new OperacaoInvalidaException(motivo);
        }
    }

    public static class SessaoExpiradaException extends RuntimeException {
        public SessaoExpiradaException() {
            super("Sessão expirada. Faça login novamente.");
        }

        public SessaoExpiradaException(String message) {
            super(message);
        }
    }

    public static class AcessoNegadoException extends RuntimeException {
        public AcessoNegadoException() {
            super("Você não tem permissão para realizar esta operação.");
        }

        public AcessoNegadoException(String message) {
            super(message);
        }
    }

    public static class DataInvalidaException extends RuntimeException {
        public DataInvalidaException() {
            super("Data inválida!");
        }

        public DataInvalidaException(String message) {
            super(message);
        }
    }

    public static class RecursoJaExisteException extends RuntimeException {
        public RecursoJaExisteException(String message) {
            super(message);
        }

        public static RecursoJaExisteException para(String entidade) {
            return new RecursoJaExisteException(entidade + " já existe.");
        }
    }

    public static class ErroInternoException extends RuntimeException {
        public ErroInternoException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public static class SenhaIncorretaException extends RuntimeException {
        public SenhaIncorretaException(String message) {
            super(message);
        }
    }

    public static class TokenInvalidoOuExpiradoException extends RuntimeException {
        public TokenInvalidoOuExpiradoException(String message) {
            super(message);
        }
    }
}
