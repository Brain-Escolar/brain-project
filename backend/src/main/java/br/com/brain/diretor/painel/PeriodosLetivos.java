package br.com.brain.diretor.painel;

import br.com.brain.configuracaoAcademica.PeriodoLetivo;

import java.time.LocalDate;
import java.util.List;

/** Leitura dos períodos letivos de um ano (já ordenados por sequência) a partir de uma data. */
final class PeriodosLetivos {

    private PeriodosLetivos() {
    }

    /**
     * O período que contém {@code hoje}. Nas férias entre períodos, o último
     * que já começou; antes do primeiro começar, o primeiro.
     */
    static PeriodoLetivo corrente(List<PeriodoLetivo> periodos, LocalDate hoje) {
        PeriodoLetivo ultimoIniciado = null;
        for (PeriodoLetivo periodo : periodos) {
            if (periodo.contem(hoje)) {
                return periodo;
            }
            if (!periodo.getDataInicio().isAfter(hoje)) {
                ultimoIniciado = periodo;
            }
        }
        return ultimoIniciado != null ? ultimoIniciado : periodos.get(0);
    }

    /** O período imediatamente antes de {@code periodo}, ou nulo se ele é o primeiro. */
    static PeriodoLetivo anterior(List<PeriodoLetivo> periodos, PeriodoLetivo periodo) {
        int indice = periodos.indexOf(periodo);
        return indice > 0 ? periodos.get(indice - 1) : null;
    }

    /** Períodos que já começaram até {@code hoje}; se nenhum começou, todos. */
    static List<PeriodoLetivo> iniciados(List<PeriodoLetivo> periodos, LocalDate hoje) {
        var iniciados = periodos.stream().filter(p -> !p.getDataInicio().isAfter(hoje)).toList();
        return iniciados.isEmpty() ? periodos : iniciados;
    }
}
