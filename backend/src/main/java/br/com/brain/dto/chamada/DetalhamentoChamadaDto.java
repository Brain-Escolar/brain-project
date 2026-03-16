package br.com.brain.dto.chamada;

import java.time.LocalDate;
import java.time.LocalTime;

import br.com.brain.domain.chamada.Chamada;

public record DetalhamentoChamadaDto(
        String disciplina, String professor, LocalTime horarioInicio, LocalDate data,
        Boolean presente) {

    public DetalhamentoChamadaDto(Chamada chamada) {
        this(
                chamada.getAula().getDisciplina().getNome(),
                chamada.getAula().getProfessor().getDadosPessoais().getNome(),
                chamada.getAula().getHorario().getHorarioInicio(),
                chamada.getData(),
                chamada.getPresente());
    }
}
