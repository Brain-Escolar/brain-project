package br.com.brain.financeiro.dto;

import br.com.brain.enums.FormaPagamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Baixa manual de uma parcela.
 *
 * Valor e data sao OPCIONAIS e e isso que faz a tela ser rapida: no caso comum
 * -- o pai pagou o valor da parcela hoje -- a secretaria escolhe a forma e
 * confirma. Os dois campos existem para os casos que fogem disso: Pix que caiu
 * no sabado e foi lancado na segunda, e boleto pago com juros.
 */
public record BaixaRequest(

        @NotNull(message = "A forma de pagamento é obrigatória.")
        FormaPagamento forma,

        /** Quando o dinheiro entrou. Omitido, usa hoje. Futuro é recusado. */
        LocalDate dataPagamento,

        /**
         * Omitido, usa o líquido da parcela. Acima do líquido é aceito (juros,
         * multa); abaixo é recusado, porque deixaria um saldo que nenhum
         * relatório cobra.
         */
        BigDecimal valorPago,

        @Size(max = 255, message = "A observação não pode passar de 255 caracteres.")
        String observacao) {
}
