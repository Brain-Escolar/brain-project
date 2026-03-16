package br.com.brain.dto.gradeCurricular;

import br.com.brain.domain.gradeCurricular.GradeCurricular;

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
