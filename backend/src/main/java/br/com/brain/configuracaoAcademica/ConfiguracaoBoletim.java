package br.com.brain.configuracaoAcademica;

import java.util.List;

/**
 * Visão composta usada pelo boletim: a escala da escola (constante,
 * {@link ConfiguracaoEscola}) + os períodos do ano letivo ({@link PeriodoLetivo}).
 */
public record ConfiguracaoBoletim(
        int anoLetivo,
        EscalaAvaliacao escala,
        List<PeriodoLetivo> periodos) {
}
