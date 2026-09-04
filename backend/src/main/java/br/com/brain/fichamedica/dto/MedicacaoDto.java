package br.com.brain.fichamedica.dto;

import java.time.LocalDate;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.medicacao.Medicacao;

public record MedicacaoDto(
        Long id,
        String tipoUso,
        String tipoUsoDescricao,
        LocalDate dataInicio,
        LocalDate dataFim,
        String medicamentos,
        String observacao,
        ListagemArquivoDto receita) {

    public MedicacaoDto(Medicacao medicacao, String downloadUrl) {
        this(
                medicacao.getId(),
                medicacao.getTipoUso() != null ? medicacao.getTipoUso().name() : null,
                medicacao.getTipoUso() != null ? medicacao.getTipoUso().getDescricao() : null,
                medicacao.getDataInicio(),
                medicacao.getDataFim(),
                medicacao.getMedicamentos(),
                medicacao.getObservacao(),
                medicacao.getArquivo() != null
                        ? new ListagemArquivoDto(medicacao.getArquivo(), downloadUrl)
                        : null);
    }
}
