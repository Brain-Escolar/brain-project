package br.com.brain.contrato.dto;

import java.util.List;

/**
 * O que impede este pagador de receber cobranca.
 *
 * A tela usa isto ANTES do clique de efetivar: descobrir que falta o CEP depois
 * de gerar contrato e titulos seria descobrir tarde demais, porque a efetivacao
 * e transacional e nao sai pela metade.
 */
public record PendenciaDoPagadorDto(
        Long responsavelId,
        String nome,
        /** Quanto deste contrato é pago por ele. */
        java.math.BigDecimal percentualRateio,
        /** Campos faltando, com o nome que aparece na tela. Vazio = pronto. */
        List<String> faltando) {

    public boolean pronto() {
        return faltando.isEmpty();
    }
}
