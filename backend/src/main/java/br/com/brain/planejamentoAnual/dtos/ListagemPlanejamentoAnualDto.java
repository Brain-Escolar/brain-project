package br.com.brain.planejamentoAnual.dtos;

import br.com.brain.planejamentoAnual.domain.PlanejamentoAnual;

public record ListagemPlanejamentoAnualDto(
        Integer ano,
        String nome,
        String contentType,
        Long tamanho,
        String downloadUrl) {

    public ListagemPlanejamentoAnualDto(PlanejamentoAnual planejamentoAnual, String downloadUrl) {
        this(
                planejamentoAnual.getAno(),
                planejamentoAnual.getArquivo().getNomeOriginal(),
                planejamentoAnual.getArquivo().getContentType(),
                planejamentoAnual.getArquivo().getTamanho(),
                downloadUrl);
    }
}
