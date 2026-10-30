package br.com.brain.financeiro.dto;

import br.com.brain.contrato.dto.TituloDto;

/**
 * O que a tela precisa depois de uma baixa ou de um estorno.
 *
 * Devolve o titulo junto com o pagamento porque quem clicou precisa ver o status
 * novo sem recarregar o carne -- e, no estorno com reemissao, precisa ver a
 * parcela que nasceu no lugar, com o vencimento que ela ganhou. Sem isso a
 * secretaria nao sabe se a divida continua viva.
 */
public record BaixaDto(
        PagamentoDto pagamento,
        TituloDto titulo,
        /** Preenchido só no estorno com reemissão. */
        TituloDto tituloReemitido) {

    public static BaixaDto de(PagamentoDto pagamento, TituloDto titulo) {
        return new BaixaDto(pagamento, titulo, null);
    }
}
