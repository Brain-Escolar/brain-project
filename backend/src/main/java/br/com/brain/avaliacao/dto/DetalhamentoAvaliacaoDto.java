package br.com.brain.avaliacao.dto;

import java.math.BigDecimal;
import java.util.List;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.avaliacao.Avaliacao;
import br.com.brain.enums.TipoAvaliacao;

public record DetalhamentoAvaliacaoDto(
        Long id,
        String nome,
        Long disciplinaId,
        String disciplina,
        TipoAvaliacao tipo,
        BigDecimal notaMaxima,
        String conteudo,
        Boolean notaExtra,
        List<ListagemArquivoDto> anexos,
        List<ListagemAvaliacaoTurmaDto> turmas) {

    public DetalhamentoAvaliacaoDto(Avaliacao avaliacao, List<ListagemArquivoDto> anexos,
            List<ListagemAvaliacaoTurmaDto> turmas) {
        this(
                avaliacao.getId(),
                avaliacao.getNome(),
                avaliacao.getDisciplina().getId(),
                avaliacao.getDisciplina().getNome(),
                avaliacao.getTipo(),
                avaliacao.getNotaMaxima(),
                avaliacao.getConteudo(),
                avaliacao.getNotaExtra(),
                anexos,
                turmas);
    }
}
