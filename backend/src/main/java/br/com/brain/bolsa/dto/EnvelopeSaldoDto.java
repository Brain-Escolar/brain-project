package br.com.brain.bolsa.dto;

import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.UnidadeMedidaEnvelope;

import java.math.BigDecimal;

/**
 * Saldo de um envelope na hora da consulta.
 *
 * `teto` e `saldo` sao nulos quando a unidade de medida nao e em dinheiro
 * (QUANTIDADE_EQUIVALENTE mede em bolsas, SEM_LIMITE nao mede nada).
 */
public record EnvelopeSaldoDto(
        Long id,
        String nome,
        NaturezaEnvelope natureza,
        UnidadeMedidaEnvelope unidadeMedida,
        BigDecimal teto,
        BigDecimal consumido,
        BigDecimal saldo,
        BigDecimal tetoEquivalente,
        BigDecimal consumidoEquivalente,
        BigDecimal saldoEquivalente,
        /** Quanto deste envelope sobra, em % da anuidade cheia DESTE aluno. */
        BigDecimal percentualDisponivel,
        Boolean permiteExcedente) {
}
