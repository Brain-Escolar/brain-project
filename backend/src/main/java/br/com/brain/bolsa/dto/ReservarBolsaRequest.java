package br.com.brain.bolsa.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Pedido de reserva de bolsa sobre uma proposta.
 *
 * Nao ha campo de perfil nem de aprovador: os dois vem do token. Se viessem
 * daqui, quem quisesse conceder 100% se declararia diretor.
 */
public record ReservarBolsaRequest(

        @NotNull(message = "A simulação é obrigatória.")
        Long simulacaoId,

        @NotNull(message = "O tipo de bolsa é obrigatório.")
        Long tipoBolsaId,

        @NotNull(message = "O percentual é obrigatório.")
        @DecimalMin(value = "0.01", message = "O percentual deve ser maior que zero.")
        @DecimalMax(value = "100.00", message = "O percentual não pode passar de 100%.")
        BigDecimal percentual,

        String motivo,

        /**
         * Por quantos dias a proposta segura orcamento. Fica no pedido porque
         * varia com a campanha -- na virada do ano a validade e curta de
         * proposito, para nao travar o orcamento com lead que nao decide.
         */
        @Min(value = 1, message = "A validade mínima é de 1 dia.")
        @Max(value = 180, message = "A validade máxima é de 180 dias.")
        Integer diasValidade) {
}
