package br.com.brain.shared;

import java.time.LocalDate;

/**
 * A regra de sobreposicao de vigencias, num lugar so.
 *
 * Nasceu em BolsaConfiguracaoService, para a matriz de descontos, e a tabela de
 * precos precisa exatamente da mesma pergunta: duas linhas valendo ao mesmo
 * tempo para o mesmo escopo deixam o sistema sem saber qual usar. Em vez de
 * copiar quatro linhas para o segundo lugar -- e deixar as duas copias
 * divergirem no dia em que alguem corrigir uma --, a regra mora aqui e os dois
 * chamam.
 */
public final class Vigencias {

    private Vigencias() {
    }

    /**
     * Fim nulo significa "sem fim", ou seja, infinito -- e nao "termina hoje".
     * Tratar nulo como data faria duas regras abertas parecerem nao se cruzar,
     * que e justamente o caso mais comum: a linha vigente quase sempre esta com
     * fim em aberto.
     */
    public static boolean cruzam(LocalDate aInicio, LocalDate aFim, LocalDate bInicio, LocalDate bFim) {
        var aComecaAntesDeBTerminar = bFim == null || !aInicio.isAfter(bFim);
        var bComecaAntesDeATerminar = aFim == null || !bInicio.isAfter(aFim);
        return aComecaAntesDeBTerminar && bComecaAntesDeATerminar;
    }
}
