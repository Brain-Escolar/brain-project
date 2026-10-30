package br.com.brain.configuracaoAcademica.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * Todos os períodos do ano, em ordem. A posição na lista é a sequência
 * (1º, 2º, ...): a tela manda o calendário inteiro e o servidor acerta a
 * diferença com o que está gravado.
 */
public record PeriodosLetivosRequest(
        @NotEmpty(message = "Informe ao menos um período.")
        List<@Valid Periodo> periodos) {

    public record Periodo(
            @NotBlank(message = "O nome do período é obrigatório.")
            @Size(max = 40, message = "O nome do período tem no máximo 40 caracteres.")
            String nome,

            @NotNull(message = "A data de início do período é obrigatória.")
            LocalDate dataInicio,

            @NotNull(message = "A data de fim do período é obrigatória.")
            LocalDate dataFim) {
    }
}
