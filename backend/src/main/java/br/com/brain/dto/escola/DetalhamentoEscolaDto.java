package br.com.brain.dto.escola;

import java.time.LocalDateTime;

public record DetalhamentoEscolaDto(
        Long id,
        String nome,
        String cnpj,
        String codigo,
        Boolean ativa,
        LocalDateTime criadaEm
) {}
