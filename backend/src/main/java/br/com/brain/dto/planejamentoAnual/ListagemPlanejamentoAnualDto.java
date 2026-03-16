package br.com.brain.dto.planejamentoAnual;

import br.com.brain.domain.planejamentoAnual.PlanejamentoAnual;

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
