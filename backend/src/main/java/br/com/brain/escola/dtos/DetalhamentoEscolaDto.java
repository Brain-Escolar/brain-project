package br.com.brain.escola.dtos;

import java.time.LocalDateTime;

public record DetalhamentoEscolaDto(
        Long id,
        String nome,
        String cnpj,
        String codigo,
        Boolean ativa,
        LocalDateTime criadaEm
) {}
