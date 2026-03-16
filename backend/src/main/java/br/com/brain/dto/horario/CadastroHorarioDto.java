package br.com.brain.dto.horario;

import jakarta.validation.constraints.Pattern;

public record CadastroHorarioDto(
        String nome,
        @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$") String horarioInicio,
        @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$") String horarioFim) {
}
