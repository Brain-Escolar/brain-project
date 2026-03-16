package br.com.brain.dto.horario;

import br.com.brain.domain.horario.Horario;

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
