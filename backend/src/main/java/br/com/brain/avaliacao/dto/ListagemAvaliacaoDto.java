package br.com.brain.avaliacao.dto;

import java.math.BigDecimal;
import java.util.List;

import br.com.brain.avaliacao.Avaliacao;
import br.com.brain.enums.TipoAvaliacao;

public record ListagemAvaliacaoDto(
        Long id,
        String nome,
        String disciplina,
        TipoAvaliacao tipo,
        BigDecimal notaMaxima,
        String conteudo,
        long totalTurmas,
        long turmasLancadas,
        List<Long> turmaIds) {

    public ListagemAvaliacaoDto(Avaliacao avaliacao, long totalTurmas, long turmasLancadas, List<Long> turmaIds) {
        this(
                avaliacao.getId(),
                avaliacao.getNome(),
                avaliacao.getDisciplina().getNome(),
                avaliacao.getTipo(),
                avaliacao.getNotaMaxima(),
                avaliacao.getConteudo(),
                totalTurmas,
                turmasLancadas,
                turmaIds);
    }
}
