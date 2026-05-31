package br.com.brain.chamada.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import br.com.brain.chamada.Chamada;

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
