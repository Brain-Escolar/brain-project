package br.com.brain.professor.dto;

import br.com.brain.anotacao.dto.AnotacaoAlunoDisciplinaDto;
import br.com.brain.notas.dto.NotaDisciplinaItemDto;

import java.math.BigDecimal;
import java.util.List;

public record DetalhamentoAlunoTurmaDto(
        Long id,
        String nome,
        String matricula,
        List<NotaDisciplinaItemDto> notas,
        BigDecimal media,
        Integer faltas,
        Integer frequencia,
        List<AnotacaoAlunoDisciplinaDto> anotacoes) {
}
