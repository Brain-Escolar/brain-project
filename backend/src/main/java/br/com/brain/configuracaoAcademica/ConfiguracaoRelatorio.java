package br.com.brain.configuracaoAcademica;

import java.util.List;

/**
 * Visão composta usada pelos relatórios acadêmicos: a escala da escola
 * (constante, {@link ConfiguracaoEscola}) + os períodos do ano letivo
 * ({@link PeriodoLetivo}).
 */
public record ConfiguracaoRelatorio(
        int anoLetivo,
        EscalaAvaliacao escala,
        List<PeriodoLetivo> periodos) {
}
