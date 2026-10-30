package br.com.brain.diretor.painel;

import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.SituacaoAula;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto.SituacaoAvaliacao;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.SituacaoProfessor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

/** Regras do acompanhamento docente: quando uma aula ou avaliação está em dia, pendente ou ainda por vir. */
final class DiarioDeClasse {

    private DiarioDeClasse() {
    }

    /** Segunda a sexta da semana de {@code data}; no sábado e no domingo, a semana que acabou de passar. */
    static List<LocalDate> semanaDe(LocalDate data) {
        var segunda = data.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<LocalDate> dias = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            dias.add(segunda.plusDays(i));
        }
        return dias;
    }

    /**
     * Uma aula com conteúdo ou chamada lançados está registrada. Sem registro, ela
     * só fica pendente depois que termina; sem horário cadastrado, no dia seguinte.
     */
    static SituacaoAula situacaoAula(boolean registrada, LocalDate data, LocalTime termino, LocalDateTime agora) {
        if (registrada) {
            return SituacaoAula.REGISTRADA;
        }
        var hoje = agora.toLocalDate();
        if (data.isBefore(hoje)) {
            return SituacaoAula.PENDENTE;
        }
        if (data.equals(hoje) && termino != null && !agora.toLocalTime().isBefore(termino)) {
            return SituacaoAula.PENDENTE;
        }
        return SituacaoAula.PREVISTA;
    }

    /**
     * Uma avaliação está lançada quando todos os alunos matriculados têm nota (ou,
     * numa turma sem matriculados, quando há alguma nota). Fora isso, atrasa no dia
     * seguinte ao prazo de entrega.
     */
    static SituacaoAvaliacao situacaoAvaliacao(LocalDate aplicacao, LocalDate prazo, int lancadas, int alunos,
            LocalDate hoje) {
        if (lancadas > 0 && lancadas >= alunos) {
            return SituacaoAvaliacao.LANCADA;
        }
        if (aplicacao != null && aplicacao.isAfter(hoje)) {
            return SituacaoAvaliacao.AGENDADA;
        }
        if (prazo != null && prazo.isBefore(hoje)) {
            return SituacaoAvaliacao.ATRASADA;
        }
        return SituacaoAvaliacao.NO_PRAZO;
    }

    static SituacaoProfessor situacaoProfessor(boolean ativo, boolean temGrade, int aulasPendentes,
            int avaliacoesPendentes) {
        if (!ativo) {
            return SituacaoProfessor.INATIVO;
        }
        if (!temGrade) {
            return SituacaoProfessor.SEM_GRADE;
        }
        return aulasPendentes > 0 || avaliacoesPendentes > 0 ? SituacaoProfessor.PENDENTE : SituacaoProfessor.EM_DIA;
    }
}
