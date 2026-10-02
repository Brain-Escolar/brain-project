package br.com.brain.crm.dto;

import br.com.brain.enums.TipoInteracao;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record CadastroInteracaoDto(
        @NotNull TipoInteracao tipo,
        String resultado,
        String observacoes,
        Instant proximaAcao,
        Long moverParaEstagioId,
        String subestagio) {
}
