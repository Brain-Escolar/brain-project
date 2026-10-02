package br.com.brain.bolsa.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Uma linha da matriz de descontos: ate quanto este tipo de bolsa chega nesta
 * serie/unidade, durante esta vigencia.
 *
 * unidade e serie nulas significam "vale para qualquer". A regra mais especifica
 * vence (serie > unidade > geral), e e por isso que a geral e a da serie podem
 * coexistir sem conflito -- o que NAO pode coexistir e duas regras de mesma
 * especificidade com vigencias que se cruzam. Ver a validacao no servico.
 */
public record MatrizDescontoRequest(

        @NotNull(message = "A política é obrigatória.")
        Long politicaId,

        @NotNull(message = "O tipo de bolsa é obrigatório.")
        Long tipoBolsaId,

        /** Nulo = vale para qualquer unidade. */
        Long unidadeId,

        /** Nulo = vale para qualquer série. */
        Long serieId,

        @NotNull(message = "O percentual máximo é obrigatório.")
        @DecimalMin(value = "0.00", message = "O percentual não pode ser negativo.")
        @DecimalMax(value = "100.00", message = "O percentual não pode passar de 100%.")
        BigDecimal percentualMax,

        /**
         * Quando a regra passa a valer. Obrigatoria porque o teto e calculado na
         * DATA DA PROPOSTA: sem inicio de vigencia nao ha como dizer qual regra
         * valia quando a proposta foi feita.
         */
        @NotNull(message = "O início da vigência é obrigatório.")
        LocalDate vigenciaInicio,

        /** Nulo = vale indefinidamente. */
        LocalDate vigenciaFim) {
}
