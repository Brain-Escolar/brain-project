package br.com.brain.bolsa.dto;

import br.com.brain.enums.PerfilNome;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Ate quanto um perfil concede sem escalar.
 *
 * O perfil vem por NOME, nao por id: id de perfil varia entre bancos de escolas
 * diferentes e quem configura pensa em "diretor", nao em "perfil 5".
 */
public record AlcadaDescontoRequest(

        @NotNull(message = "A política é obrigatória.")
        Long politicaId,

        @NotNull(message = "O perfil é obrigatório.")
        PerfilNome perfil,

        @NotNull(message = "O percentual máximo é obrigatório.")
        @DecimalMin(value = "0.00", message = "O percentual não pode ser negativo.")
        @DecimalMax(value = "100.00", message = "O percentual não pode passar de 100%.")
        BigDecimal percentualMax,

        /**
         * Quem pode autorizar concessao que estoura o orcamento.
         *
         * Furar a alcada bloqueia e escala; furar o envelope avisa e exige este
         * aval. Sao coisas diferentes de proposito: alcada e regra de quem pode,
         * envelope e dinheiro que acabou.
         */
        Boolean podeExcederEnvelope) {
}
