package br.com.brain.contrato.dto;

import br.com.brain.contrato.Titulo;
import br.com.brain.enums.StatusTitulo;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TituloDto(
        Long id,
        Long responsavelId,
        Integer numeroParcela,
        /**
         * Qual tentativa desta parcela é. 1 no carnê original; 2 ou mais quando a
         * parcela foi reemitida. A tela precisa disto para não mostrar duas linhas
         * iguais da parcela 3 sem explicar a diferença.
         */
        Integer versao,
        LocalDate competencia,
        LocalDate vencimento,
        String descricao,
        BigDecimal valorBruto,
        /** Separado do bruto para a bolsa aparecer no boleto, e não só o líquido. */
        BigDecimal valorDesconto,
        BigDecimal valorLiquido,
        StatusTitulo status,
        /**
         * Quantos titulos o ITEM que gerou esta cobranca produz -- nao quantas
         * parcelas o contrato tem.
         *
         * Nem todo item vira carne: taxa de matricula e material sao cobrados
         * de uma vez, na primeira competencia. Enquanto esta tela dividia o
         * numero da parcela pelas parcelas do contrato, a taxa de material
         * aparecia como "parcela 1/12" -- uma cobranca unica fingindo que
         * teriam mais onze.
         */
        Integer totalParcelas,
        Boolean vencido) {

    /**
     * @param parcelasDoContrato usado so quando o titulo nao tem item (anterior
     *                           a V117): ali o contrato inteiro era uma coisa so.
     */
    public TituloDto(Titulo t, int parcelasDoContrato) {
        this(
                t.getId(),
                t.getResponsavel().getId(),
                t.getNumeroParcela(),
                t.getVersao(),
                t.getCompetencia(),
                t.getVencimento(),
                t.getDescricao(),
                t.getValorBruto(),
                t.getValorDesconto(),
                t.getValorLiquido(),
                t.getStatus(),
                t.getContratoItem() == null
                        ? parcelasDoContrato
                        : t.getContratoItem().quantidadeDeTitulos(parcelasDoContrato),
                t.estaAberto() && t.getVencimento().isBefore(LocalDate.now()));
    }
}
