package br.com.brain.planejamentoAnual.dto;

import br.com.brain.planejamentoAnual.PlanejamentoAnual;

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
