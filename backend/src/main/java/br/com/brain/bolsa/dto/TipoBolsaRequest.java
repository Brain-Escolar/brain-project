package br.com.brain.bolsa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Um tipo de bolsa: social, irmao, funcionario, convenio, merito, pontualidade.
 * O codigo e unico no banco e e por ele que o resto do sistema se refere ao tipo.
 */
public record TipoBolsaRequest(

        @NotBlank(message = "O código é obrigatório.")
        @Size(max = 30, message = "O código tem no máximo 30 caracteres.")
        String codigo,

        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 100, message = "O nome tem no máximo 100 caracteres.")
        String nome,

        /**
         * true  = renuncia planejada (social, irmao, funcionario): CONSOME envelope.
         * false = incentivo condicional (pontualidade): nao consome.
         *
         * Juntar os dois num numero so infla a renuncia declarada e a torna
         * inutil para decidir -- desconto de pontualidade nao e bolsa, e politica
         * de cobranca.
         */
        @NotNull(message = "Informe se a bolsa é estrutural: é isso que decide se ela consome orçamento.")
        Boolean estrutural,

        Boolean exigeComprovacao,

        /** Entra na contagem de bolsas para o CEBAS. */
        Boolean contaParaCebas,

        Boolean acumulaComOutras,

        Boolean ativo,

        /**
         * Sobre quais produtos a bolsa incide: mensalidade sim, passeio nao.
         *
         * Sem nenhum produto o calculo do teto nao tem base e falha dizendo
         * exatamente isso -- entao vale configurar junto.
         */
        List<Long> produtoIds) {
}
