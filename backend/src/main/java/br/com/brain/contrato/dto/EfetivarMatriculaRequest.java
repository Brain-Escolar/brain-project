package br.com.brain.contrato.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Efetiva a matricula a partir de uma proposta.
 *
 * Nenhum valor entra aqui de proposito: preco, desconto, parcelas e dia de
 * vencimento vem todos da simulacao. Aceitar valor neste pedido abriria caminho
 * para o contrato sair diferente da proposta que a familia aceitou.
 */
public record EfetivarMatriculaRequest(

        @NotNull(message = "A proposta é obrigatória.")
        Long simulacaoId,

        /** Opcional: a enturmação pode acontecer depois. */
        Long turmaId,

        /** Padrão: hoje. É a data que vale para contagem de vaga. */
        LocalDate dataEfetivacao,

        /**
         * Mês da primeira parcela. Omitido, usa fevereiro do ano letivo — ou o mês
         * da efetivação, se for mais tarde, para não gerar parcela vencida no
         * passado. O dia é ignorado: competência é sempre dia 1.
         */
        LocalDate primeiraCompetencia) {
}
