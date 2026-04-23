package br.com.brain.notas.dtos;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.notas.domain.Notas;

import java.util.List;

public record DetalhamentoNotasAlunoDisciplinaDto(
        String nomeCompleto,
        List<NotaDisciplinaItemDto> notas) {

    public DetalhamentoNotasAlunoDisciplinaDto(Aluno aluno, List<Notas> notas) {
        this(
                aluno.getDadosPessoais().getNome(),
                notas.stream().map(NotaDisciplinaItemDto::new).toList());
    }
}
