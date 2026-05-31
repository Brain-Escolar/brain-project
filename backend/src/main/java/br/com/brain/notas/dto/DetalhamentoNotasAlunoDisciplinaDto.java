package br.com.brain.notas.dto;

import br.com.brain.aluno.models.Aluno;
import br.com.brain.notas.models.Notas;

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
