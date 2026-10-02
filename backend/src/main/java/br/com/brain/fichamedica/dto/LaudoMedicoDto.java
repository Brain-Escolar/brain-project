package br.com.brain.fichamedica.dto;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.laudoMedico.LaudoMedico;

public record LaudoMedicoDto(
        Long id,
        String tipo,
        String tipoDescricao,
        String observacao,
        ListagemArquivoDto arquivo,
        String nome,
        String contentType,
        Long tamanho,
        String downloadUrl) {

    public LaudoMedicoDto(LaudoMedico laudo, String downloadUrl) {
        this(
                laudo.getId(),
                laudo.getTipo() != null ? laudo.getTipo().name() : null,
                laudo.getTipo() != null ? laudo.getTipo().getDescricao() : null,
                laudo.getObservacao(),
                laudo.getArquivo() != null ? new ListagemArquivoDto(laudo.getArquivo(), downloadUrl) : null,
                laudo.getArquivo() != null ? laudo.getArquivo().getNomeOriginal() : null,
                laudo.getArquivo() != null ? laudo.getArquivo().getContentType() : null,
                laudo.getArquivo() != null ? laudo.getArquivo().getTamanho() : null,
                downloadUrl);
    }
}
