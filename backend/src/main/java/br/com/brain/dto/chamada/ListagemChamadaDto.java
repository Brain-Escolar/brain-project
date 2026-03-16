package br.com.brain.dto.chamada;

import br.com.brain.domain.chamada.Chamada;

public record ListagemChamadaDto(Long id, String disciplina, String professor, String turma, String horarioInicio,
        String data, String aluno, Boolean presente) {

    public ListagemChamadaDto(Chamada chamada) {
        this(
                chamada.getId(),
                chamada.getAula().getDisciplina().getNome(),
                chamada.getAula().getProfessor().getDadosPessoais().getNome(),
                chamada.getAula().getTurma().getNome(),
                chamada.getAula().getHorario().getHorarioInicio().toString(),
                chamada.getData().toString(),
                chamada.getAluno().getDadosPessoais().getNome(),
                chamada.getPresente());
    }
}
