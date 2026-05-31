package br.com.brain.disponibilidadeProfessor.dto;

import br.com.brain.disponibilidadeProfessor.DisponibilidadeProfessor;

public record ListagemDisponibilidadeProfessorDto(
        String professor,
        String horarioInicio,
        String horarioFim) {

    public ListagemDisponibilidadeProfessorDto(DisponibilidadeProfessor disponibilidadeProfessor) {
        this(
                disponibilidadeProfessor.getProfessor().getDadosPessoais().getNome(),
                disponibilidadeProfessor.getHorario().getHorarioInicio().toString(),
                disponibilidadeProfessor.getHorario().getHorarioFim().toString());
    }
}
