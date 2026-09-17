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
        BigDecimal percentual,
        BigDecimal valorRenunciaAnual,
        BigDecimal equivalenteBolsa,
        StatusConcessaoBolsa status,
        LocalDate vigenciaInicio,
        LocalDate vigenciaFim,
        String motivo,
        Boolean excedeuEnvelope,
        Instant reservaExpiraEm) {

    public ConcessaoBolsaDto(ConcessaoBolsa c) {
        this(
                c.getId(),
                c.getSimulacao() == null ? null : c.getSimulacao().getId(),
                c.getContratoId(),
                c.getTipoBolsa().getNome(),
                c.getPercentual(),
                c.getValorRenunciaAnual(),
                c.getEquivalenteBolsa(),
                c.getStatus(),
                c.getVigenciaInicio(),
                c.getVigenciaFim(),
                c.getMotivo(),
                c.getExcedeuEnvelope(),
                c.getSimulacao() == null ? null : c.getSimulacao().getReservaExpiraEm());
    }
}
