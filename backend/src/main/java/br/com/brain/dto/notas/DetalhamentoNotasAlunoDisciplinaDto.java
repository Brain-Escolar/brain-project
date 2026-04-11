package br.com.brain.dto.notas;

import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.notas.Notas;

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
