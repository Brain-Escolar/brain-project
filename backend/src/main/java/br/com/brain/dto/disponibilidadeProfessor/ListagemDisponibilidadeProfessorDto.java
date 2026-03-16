package br.com.brain.dto.disponibilidadeProfessor;

import br.com.brain.domain.disponibilidadeProfessor.DisponibilidadeProfessor;

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
