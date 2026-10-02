package br.com.brain.bolsa.dto;

import br.com.brain.bolsa.EnvelopeBolsa;
import br.com.brain.enums.BaseCalculoEnvelope;
import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.UnidadeMedidaEnvelope;

import java.math.BigDecimal;

/**
 * O envelope como configuracao, com o consumo que ja carrega.
 *
 * Diferente do EnvelopeSaldoDto, que responde "quanto cabe para ESTE aluno" e
 * por isso fala em percentual da anuidade dele. Aqui a pergunta e outra: como
 * este envelope esta configurado e quanto dele ja foi gasto.
 */
public record EnvelopeConfiguracaoDto(
        Long id,
        Long politicaId,
        String nome,
        NaturezaEnvelope natureza,
        UnidadeMedidaEnvelope unidadeMedida,
        BigDecimal valorLimite,
        BigDecimal percentualLimite,
        BigDecimal quantidadeLimite,
        BaseCalculoEnvelope baseCalculo,
        BigDecimal receitaProjetada,
        Long unidadeId,
        Long serieId,
        Long tipoBolsaId,
        Boolean permiteExcedente,
        Boolean ativo,
        /** Segurado por proposta de pe, com validade. */
        BigDecimal reservado,
        /** Gasto: matricula efetivada. */
        BigDecimal comprometido,
        BigDecimal reservadoEquiv,
        BigDecimal comprometidoEquiv,
        /** Escopo todo nulo = envelope global do ano letivo. */
        Boolean global) {

    public EnvelopeConfiguracaoDto(EnvelopeBolsa e) {
        this(
                e.getId(),
                e.getPolitica().getId(),
                e.getNome(),
                e.getNatureza(),
                e.getUnidadeMedida(),
                e.getValorLimite(),
                e.getPercentualLimite(),
                e.getQuantidadeLimite(),
                e.getBaseCalculo(),
                e.getReceitaProjetada(),
                e.getUnidade() == null ? null : e.getUnidade().getId(),
                e.getSerie() == null ? null : e.getSerie().getId(),
                e.getTipoBolsa() == null ? null : e.getTipoBolsa().getId(),
                e.getPermiteExcedente(),
                e.getAtivo(),
                e.getReservado(),
                e.getComprometido(),
                e.getReservadoEquiv(),
                e.getComprometidoEquiv(),
                e.getUnidade() == null && e.getSerie() == null && e.getTipoBolsa() == null);
    }
}
