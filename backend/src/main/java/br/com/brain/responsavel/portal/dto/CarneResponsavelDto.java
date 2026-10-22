package br.com.brain.responsavel.portal.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * O extrato do responsavel: o que ele deve, o que ja pagou e o que vem.
 *
 * Os totais ignoram parcelas canceladas, renegociadas e estornadas de proposito.
 * Essas linhas continuam na lista -- a familia tem direito de ver o historico --
 * mas somar a versao antiga e a nova da mesma parcela diria que ela deve o dobro.
 */
public record CarneResponsavelDto(
        Integer anoLetivo,
        /** Soma das parcelas que valem: abertas mais pagas. */
        BigDecimal totalContratado,
        BigDecimal totalPago,
        BigDecimal totalAberto,
        BigDecimal totalEmAtraso,
        /**
         * Quanto a bolsa abateu no periodo, somando as parcelas que valem. E o
         * numero que a familia nunca viu: aparece na proposta e depois desaparece.
         */
        BigDecimal totalDeBolsa,
        LocalDate proximoVencimento,
        BigDecimal valorDoProximoVencimento,
        int parcelasEmAtraso,
        List<ParcelaPortalDto> parcelas) {
}
