package br.com.brain.fichamedica.dto;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.laudoMedico.LaudoMedico;

public record LaudoMedicoDto(
        Long id,
        String tipo,
        String tipoDescricao,
        String observacao,
        ListagemArquivoDto arquivo) {

    public LaudoMedicoDto(LaudoMedico laudo, String downloadUrl) {
        this(
                laudo.getId(),
                laudo.getTipo() != null ? laudo.getTipo().name() : null,
                laudo.getTipo() != null ? laudo.getTipo().getDescricao() : null,
                laudo.getObservacao(),
                laudo.getArquivo() != null ? new ListagemArquivoDto(laudo.getArquivo(), downloadUrl) : null);
    }
}
