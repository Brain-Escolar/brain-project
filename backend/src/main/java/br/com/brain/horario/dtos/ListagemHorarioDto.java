package br.com.brain.horario.dtos;

import br.com.brain.horario.domain.Horario;

public record ListagemHorarioDto(
        Long id,
        String nome,
        String horarioInicio,
        String horarioFim) {

    public ListagemHorarioDto(Horario horario) {
        this(
                horario.getId(),
                horario.getNome(),
                horario.getHorarioInicio().toString(),
                horario.getHorarioFim().toString());
    }
}
