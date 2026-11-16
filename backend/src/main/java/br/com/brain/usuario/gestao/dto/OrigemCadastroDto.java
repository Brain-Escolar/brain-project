package br.com.brain.usuario.gestao.dto;

/** Onde a pessoa foi cadastrada, para a tela levar ao cadastro de origem. */
public record OrigemCadastroDto(Tipo tipo, Long id) {

    public enum Tipo {
        ALUNO, PROFESSOR, SECRETARIO, RESPONSAVEL
    }
}
