package br.com.brain.configuracaoAcademica.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Só o ano: os períodos nascem copiados do ano anterior (mesmas datas, um ano
 * à frente) ou, sem ano anterior, como 4 bimestres — e se ajustam depois.
 */
public record CadastroAnoLetivoRequest(
        @NotNull(message = "O ano letivo é obrigatório.")
        @Min(value = 2000, message = "Ano letivo implausível.")
        @Max(value = 2100, message = "Ano letivo implausível.")
        Integer ano) {
}
