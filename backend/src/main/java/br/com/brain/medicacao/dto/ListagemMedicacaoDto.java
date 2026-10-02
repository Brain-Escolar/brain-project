package br.com.brain.medicacao.dto;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.medicacao.Medicacao;

import java.time.Instant;
import java.time.LocalDate;

public record ListagemMedicacaoDto(
        Long id,
        String nome,
        String dosagem,
        String horario,
        String observacao,
        Instant registradaEm,
        String tipoUso,
        String tipoUsoDescricao,
        LocalDate dataInicio,
        LocalDate dataFim,
        ListagemArquivoDto receita) {

    public ListagemMedicacaoDto(Medicacao medicacao, String urlReceita) {
        this(
                medicacao.getId(),
                medicacao.getNome(),
                medicacao.getDosagem(),
                medicacao.getHorario(),
                medicacao.getObservacao(),
                medicacao.getCriadoEm(),
                medicacao.getTipoUso() != null ? medicacao.getTipoUso().name() : null,
                medicacao.getTipoUso() != null ? medicacao.getTipoUso().getDescricao() : null,
                medicacao.getDataInicio(),
                medicacao.getDataFim(),
                medicacao.getArquivo() != null
                        ? new ListagemArquivoDto(medicacao.getArquivo(), urlReceita)
                        : null);
    }
}
