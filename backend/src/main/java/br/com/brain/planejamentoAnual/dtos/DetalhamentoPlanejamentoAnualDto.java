package br.com.brain.planejamentoAnual.dtos;

import br.com.brain.planejamentoAnual.domain.PlanejamentoAnual;

public record DetalhamentoPlanejamentoAnualDto(
        Long id,
        Integer ano,
        String nome,
        String contentType,
        Long tamanho
) {

    public DetalhamentoPlanejamentoAnualDto(PlanejamentoAnual planejamentoAnual) {
        this(
                planejamentoAnual.getId(),
                planejamentoAnual.getAno(),
                planejamentoAnual.getArquivo().getNomeOriginal(),
                planejamentoAnual.getArquivo().getContentType(),
                planejamentoAnual.getArquivo().getTamanho());
    }
}
