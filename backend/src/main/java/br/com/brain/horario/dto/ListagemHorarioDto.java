package br.com.brain.horario.dto;

import br.com.brain.horario.models.Horario;

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
