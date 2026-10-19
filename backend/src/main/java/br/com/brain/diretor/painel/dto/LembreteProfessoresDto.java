package br.com.brain.diretor.painel.dto;

import java.util.List;

/** Professores a lembrar das pendências; vazio ou nulo = todos os que têm pendência. */
public record LembreteProfessoresDto(List<Long> professorIds) {
}
