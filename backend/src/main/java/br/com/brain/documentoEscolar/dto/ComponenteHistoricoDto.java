package br.com.brain.documentoEscolar.dto;

import java.util.List;

/** Linha do histórico: um componente curricular com a nota de cada ano (mesma ordem de {@code anos}). */
public record ComponenteHistoricoDto(
        String area,
        String nome,
        List<NotaAnoHistoricoDto> anos) {
}
