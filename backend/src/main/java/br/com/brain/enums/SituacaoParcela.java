package br.com.brain.enums;

import java.time.LocalDate;

/**
 * O que a familia ve na linha da parcela.
 *
 * Existe separado de StatusTitulo porque sao perguntas diferentes: StatusTitulo
 * responde "o que aconteceu com este registro"; isto responde "preciso pagar
 * isso, e quando". A diferenca que justifica o enum esta no ABERTO: um titulo
 * aberto pode estar a vencer, vencendo hoje ou em atraso, e quem decide e o
 * calendario, nao o status.
 */
public enum SituacaoParcela {
    PAGA,
    A_VENCER,
    VENCE_HOJE,
    EM_ATRASO,
    /** Cancelada pela escola. Nao precisa ser paga. */
    CANCELADA,
    /** Substituida por outra parcela (renegociacao). */
    SUBSTITUIDA,
    /** A baixa foi desfeita. Se a divida persiste, existe outra parcela no lugar. */
    ESTORNADA;

    public static SituacaoParcela de(StatusTitulo status, LocalDate vencimento, LocalDate hoje) {
        return switch (status) {
            case PAGO -> PAGA;
            case CANCELADO -> CANCELADA;
            case RENEGOCIADO -> SUBSTITUIDA;
            case ESTORNADO -> ESTORNADA;
            case ABERTO -> {
                if (vencimento.isEqual(hoje)) {
                    yield VENCE_HOJE;
                }
                yield vencimento.isBefore(hoje) ? EM_ATRASO : A_VENCER;
            }
        };
    }

    public boolean exigePagamento() {
        return this == A_VENCER || this == VENCE_HOJE || this == EM_ATRASO;
    }
}
