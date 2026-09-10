package br.com.brain.medicacao.dto;

import br.com.brain.medicacao.Medicacao;

import java.time.Instant;

public record ListagemMedicacaoDto(
        Long id,
        String nome,
        String dosagem,
        String horario,
        String observacao,
        Instant registradaEm) {

    public ListagemMedicacaoDto(Medicacao medicacao) {
        this(
                medicacao.getId(),
                medicacao.getNome(),
                medicacao.getDosagem(),
                medicacao.getHorario(),
                medicacao.getObservacao(),
                medicacao.getCriadoEm());
    }
}
