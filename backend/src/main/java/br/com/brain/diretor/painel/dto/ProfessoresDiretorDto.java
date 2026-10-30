package br.com.brain.diretor.painel.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Lista de acompanhamento docente da Direção: como anda o diário de classe e o
 * lançamento de notas de cada professor no período letivo corrente.
 *
 * <p>Aulas "previstas" são as da grade que já aconteceram no período (dias
 * letivos, sem feriados); "pendentes" são as previstas sem conteúdo nem
 * chamada lançados. Avaliações "pendentes" são as que passaram do prazo de
 * entrega de notas sem todas as notas lançadas.
 */
public record ProfessoresDiretorDto(
        PeriodoDto periodo,
        List<DiaDto> semana,
        ResumoDto resumo,
        List<ProfessorLinhaDto> professores) {

    public record PeriodoDto(String nome, LocalDate inicio, LocalDate fim) {
    }

    /** Um dia (segunda a sexta) da semana atual, na coluna "Diário da semana"; {@code feriado} é o nome, se houver. */
    public record DiaDto(LocalDate data, String feriado) {
    }

    public record ResumoDto(
            int professoresAtivos,
            int professoresSemGrade,
            int diariosEmDia,
            int professoresComGrade,
            int aulasPendentes,
            int avaliacoesPendentes,
            int professoresComPendencia) {
    }

    public record ProfessorLinhaDto(
            Long id,
            String nome,
            List<String> disciplinas,
            int turmas,
            List<DiaProfessorDto> semana,
            int aulasPrevistas,
            int aulasRegistradas,
            int aulasPendentes,
            int avaliacoesAplicadas,
            int avaliacoesLancadas,
            int avaliacoesPendentes,
            LocalDateTime ultimoRegistro,
            SituacaoProfessor situacao) {
    }

    /** Aulas do professor num dia da semana e como estão no diário. */
    public record DiaProfessorDto(LocalDate data, int aulas, int registradas, int pendentes) {
    }

    public enum SituacaoProfessor {
        EM_DIA,
        PENDENTE,
        SEM_GRADE,
        INATIVO
    }
}
