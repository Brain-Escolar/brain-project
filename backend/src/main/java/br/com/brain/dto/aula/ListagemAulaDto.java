package br.com.brain.dto.aula;

import br.com.brain.domain.aula.Aula;

public record ListagemAulaDto(Long id, String unidade, String serie, String turma, String disciplina, String professor,
        String diaDaSemana, String sala, String horarioInicio, String horarioFim) {

    public ListagemAulaDto(Aula aula) {
        this(
                aula.getId(),
                aula.getTurma().getUnidade().getNome(),
                aula.getTurma().getSerie().getNome(),
                aula.getTurma().getNome(),
                aula.getDisciplina().getNome(),
                aula.getProfessor() == null ? "Sem professor" : aula.getProfessor().getDadosPessoais().getNome(),
                aula.getDiaSemana().name(),
                aula.getTurma().getSala(),
                aula.getHorario().getHorarioInicio().toString(),
                aula.getHorario().getHorarioFim().toString());
    }
}
