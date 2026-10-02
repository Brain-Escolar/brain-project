package br.com.brain.bolsa.dto;

import java.math.BigDecimal;

/**
 * Cache do envelope contra a soma do razao.
 *
 * Existe porque reservado/comprometido em envelopes_bolsa sao cache: a verdade e
 * movimentos_envelope. O cache evita varrer o razao a cada tecla na tela de
 * matricula, mas cache que divergiu nao da erro nenhum -- so entrega relatorio
 * de renuncia errado no fim do ano, quando ninguem mais sabe de onde veio a
 * diferenca.
 *
 * Por isso isto e consultavel: e o que permite responder "o saldo esta certo?"
 * sem auditoria manual.
 */
public record ConciliacaoEnvelopeDto(
        Long envelopeId,
        String nome,
        BigDecimal reservadoCache,
        BigDecimal reservadoRazao,
        BigDecimal comprometidoCache,
        BigDecimal comprometidoRazao,
        /** Falso aqui significa que o cache mentiu e precisa de correcao. */
        Boolean confere) {

    public static ConciliacaoEnvelopeDto de(Long id, String nome,
            BigDecimal reservadoCache, BigDecimal reservadoRazao,
            BigDecimal comprometidoCache, BigDecimal comprometidoRazao) {

        var ok = reservadoCache.compareTo(reservadoRazao) == 0
                && comprometidoCache.compareTo(comprometidoRazao) == 0;

        return new ConciliacaoEnvelopeDto(id, nome,
                reservadoCache, reservadoRazao, comprometidoCache, comprometidoRazao, ok);
    }
}
