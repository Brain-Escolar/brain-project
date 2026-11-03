package br.com.brain.bolsa.dto;

import br.com.brain.bolsa.ConcessaoBolsa;
import br.com.brain.enums.StatusConcessaoBolsa;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ConcessaoBolsaDto(
        Long id,
        Long simulacaoId,
        Long contratoId,
        String tipoBolsa,
        /** Quem aprova decide por aluno e série, não por id de concessão. */
        String alunoNome,
        String serieNome,
        BigDecimal percentual,
        /** O que foi pedido. Diferente de `percentual` quando a aprovação cortou. */
        BigDecimal percentualPedido,
        BigDecimal valorRenunciaAnual,
        BigDecimal equivalenteBolsa,
        StatusConcessaoBolsa status,
        LocalDate vigenciaInicio,
        LocalDate vigenciaFim,
        String motivo,
        /** Por que aprovou, aprovou menos, ou recusou. */
        String motivoDecisao,
        String solicitadoPor,
        String aprovadoPor,
        Instant aprovadoEm,
        Boolean excedeuEnvelope,
        Instant reservaExpiraEm) {

    public ConcessaoBolsaDto(ConcessaoBolsa c) {
        this(
                c.getId(),
                c.getSimulacao() == null ? null : c.getSimulacao().getId(),
                c.getContratoId(),
                c.getTipoBolsa().getNome(),
                nomeDoAluno(c),
                c.getSimulacao() == null || c.getSimulacao().getSerie() == null
                        ? null : c.getSimulacao().getSerie().getNome(),
                c.getPercentual(),
                c.getPercentualPedido(),
                c.getValorRenunciaAnual(),
                c.getEquivalenteBolsa(),
                c.getStatus(),
                c.getVigenciaInicio(),
                c.getVigenciaFim(),
                c.getMotivo(),
                c.getMotivoDecisao(),
                c.getSolicitadoPor() == null ? null : c.getSolicitadoPor().getNome(),
                c.getAprovadoPor() == null ? null : c.getAprovadoPor().getNome(),
                c.getAprovadoEm(),
                c.getExcedeuEnvelope(),
                c.getSimulacao() == null ? null : c.getSimulacao().getReservaExpiraEm());
    }

    /**
     * Lead ainda sem aluno cadastrado é caso normal no CRM, e cadastro mínimo
     * deixa dadosPessoais nulo. Uma fila de aprovação que estoura por causa
     * disso é pior que uma linha sem nome.
     */
    private static String nomeDoAluno(ConcessaoBolsa c) {
        if (c.getSimulacao() == null || c.getSimulacao().getAluno() == null) {
            return null;
        }
        var dados = c.getSimulacao().getAluno().getDadosPessoais();
        return dados == null ? null : dados.getNome();
    }
}
