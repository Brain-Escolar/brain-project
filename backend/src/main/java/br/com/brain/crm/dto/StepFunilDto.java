package br.com.brain.crm.dto;

import java.time.Instant;

public record StepFunilDto(Long estagioId, String nome, Integer ordem, boolean concluido, boolean atual,
        Instant dataEntrada) {
}
