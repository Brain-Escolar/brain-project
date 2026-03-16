package br.com.brain.exception;

public final class ErrosSistema {
    private ErrosSistema() {}

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
    }

    public static class SessaoExpiradaException extends RuntimeException {
        public SessaoExpiradaException(String message) {
            super(message);
        }
    }

    public static class AcessoNegadoException extends RuntimeException {
        public AcessoNegadoException(String message) {
            super(message);
        }
    }
}
