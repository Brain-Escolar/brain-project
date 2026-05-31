package br.com.brain.gradeCurricular.dto;

import br.com.brain.gradeCurricular.models.GradeCurricular;

public record ListagemGradeCurricularDto(
        Long id,
        String nome,
        String versao,
        Boolean ativo) {

    public ListagemGradeCurricularDto(GradeCurricular gradeCurricular) {
        this(
                gradeCurricular.getId(),
                gradeCurricular.getNome(),
                gradeCurricular.getVersao(),
                gradeCurricular.getAtivo());
    }
}
