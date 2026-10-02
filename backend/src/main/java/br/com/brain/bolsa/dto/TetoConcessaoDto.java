package br.com.brain.bolsa.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * O que a tela de matricula mostra ao funcionario: quanto ele pode conceder de
 * bolsa para este aluno, e por que esse e o limite.
 *
 * Os tres tetos aparecem separados de proposito. Quando o funcionario ve 20% e
 * nao entende, a resposta esta em qual dos tres esta segurando.
 */
public record TetoConcessaoDto(
        Integer anoLetivo,
        String tipoBolsa,
        BigDecimal valorCheioAnual,
        BigDecimal tetoMatrizPct,
        BigDecimal tetoAlcadaPct,
        BigDecimal tetoEnvelopePct,
        BigDecimal podeConcederPct,
        BigDecimal podeConcederValor,
        LimiteAtingido limiteAtingido,
        EnvelopeSaldoDto envelopeRestritivo,
        List<EnvelopeSaldoDto> envelopes) {

    /** Qual dos tres esta segurando. A tela usa isto para explicar o numero. */
    public enum LimiteAtingido {
        /** A matriz de descontos nao permite mais que isso para esta serie/tipo. */
        MATRIZ,
        /** O perfil do usuario nao alcanca mais que isso; acima, escala. */
        ALCADA,
        /** O orcamento de bolsa nao comporta mais que isso. */
        ENVELOPE
    }
}
