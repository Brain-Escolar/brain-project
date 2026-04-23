package br.com.brain.gradeCurricular.dtos;

import br.com.brain.gradeCurricular.domain.GradeCurricular;

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
