package br.com.brain.aula.dto;

import br.com.brain.aula.Aula;

public record ListagemAulaDto(Long id, String unidade, Long serieId, String serie, Long turmaId, String turma,
        Long disciplinaId, String disciplina, String professor, String diaDaSemana, String sala, String horarioInicio,
        String horarioFim) {

    public ListagemAulaDto(Aula aula) {
        this(
                aula.getId(),
                aula.getTurma().getUnidade().getNome(),
                aula.getTurma().getSerie().getId(),
                aula.getTurma().getSerie().getNome(),
                aula.getTurma().getId(),
                aula.getTurma().getNome(),
                aula.getDisciplina().getId(),
                aula.getDisciplina().getNome(),
                aula.getProfessor() == null ? "Sem professor" : aula.getProfessor().getDadosPessoais().getNome(),
                aula.getDiaSemana().name(),
                aula.getTurma().getSala(),
                aula.getHorario().getHorarioInicio().toString(),
                aula.getHorario().getHorarioFim().toString());
    }
}
