package br.com.brain.produto.dto;

import br.com.brain.enums.Turno;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Um preco da modalidade, por dimensao e vigencia.
 *
 * As quatro dimensoes sao OPCIONAIS e nulo significa "vale para qualquer" -- um
 * preco sem serie vale para todas as series. A linha mais especifica vence
 * (ProdutoPreco.especificidade), entao a escola cadastra um preco geral e so
 * excecoes em cima dele, em vez de uma linha por combinacao.
 */
public record CadastroProdutoPrecoDto(

        Integer anoLetivo,
        Long unidadeId,
        Long serieId,
        Turno turno,

        @NotNull(message = "O valor é obrigatório.")
        @PositiveOrZero(message = "O valor não pode ser negativo.")
        BigDecimal valor,

        @NotNull(message = "A data de início da vigência é obrigatória.")
        LocalDate vigenciaInicio,

        /** Nulo = sem fim. É o caso normal do preço vigente. */
        LocalDate vigenciaFim,

        /**
         * Reajuste: encerra o preço que hoje vale para este mesmo escopo, no dia
         * anterior ao início deste, em vez de recusar por sobreposição.
         *
         * É o caminho que a V100 chama de disciplina — "nunca editar valor no
         * lugar; reajuste é fechar a vigência da linha atual e inserir outra".
         * Sem isto na API, a tela teria de fazer duas chamadas e, se a segunda
         * falhasse, a escola ficaria sem preço nenhum.
         */
        Boolean encerrarAnterior) {

    public boolean deveEncerrarAnterior() {
        return Boolean.TRUE.equals(encerrarAnterior);
    }
}
