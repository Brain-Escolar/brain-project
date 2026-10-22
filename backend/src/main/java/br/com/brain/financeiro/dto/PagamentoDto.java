package br.com.brain.financeiro.dto;

import br.com.brain.enums.FormaPagamento;
import br.com.brain.financeiro.Pagamento;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PagamentoDto(
        Long id,
        Long tituloId,
        BigDecimal valorPago,
        LocalDate dataPagamento,
        FormaPagamento forma,
        String observacao,
        Long registradoPorId,
        /** Nome de quem deu a baixa, resolvido pelo serviço. Pode vir nulo. */
        String registradoPor,
        Boolean estornado,
        Instant estornadoEm,
        String motivoEstorno) {

    public static PagamentoDto de(Pagamento p, String nomeDoOperador) {
        return new PagamentoDto(
                p.getId(),
                p.getTitulo().getId(),
                p.getValorPago(),
                p.getDataPagamento(),
                p.getForma(),
                p.getObservacao(),
                p.getRegistradoPorId(),
                nomeDoOperador,
                !p.estaVivo(),
                p.getEstornadoEm(),
                p.getMotivoEstorno());
    }
}
