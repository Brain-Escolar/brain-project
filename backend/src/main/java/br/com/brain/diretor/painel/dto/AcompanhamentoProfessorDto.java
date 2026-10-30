package br.com.brain.diretor.painel.dto;

import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.PeriodoDto;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto.SituacaoProfessor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Acompanhamento de um professor pela Direção: resumo e turmas no período
 * corrente, o diário de classe de uma semana, as avaliações do período e as
 * anotações que ele registrou sobre alunos.
 */
public record AcompanhamentoProfessorDto(
        ProfessorDto professor,
        PeriodoDto periodo,
        BigDecimal mediaMinima,
        ResumoDto resumo,
        List<AulaPendenteDto> aulasPendentes,
        List<TurmaDto> turmas,
        SemanaDto semana,
        List<AvaliacaoDto> avaliacoes,
        List<AnotacaoDto> anotacoes) {

    public record ProfessorDto(
            Long id,
            String nome,
            String email,
            List<String> disciplinas,
            List<String> turnos,
            List<String> unidades,
            boolean ativo,
            SituacaoProfessor situacao) {
    }

    public record ResumoDto(
            int aulasPrevistas,
            int aulasRegistradas,
            int aulasPendentes,
            BigDecimal frequencia,
            int avaliacoesAplicadas,
            int avaliacoesLancadas,
            int avaliacoesPendentes,
            LocalDateTime ultimoRegistro) {
    }

    public record AulaPendenteDto(LocalDate data, String turma, String serie, String disciplina, String horario) {
    }

    /** Uma linha por turma e disciplina que o professor leciona. */
    public record TurmaDto(
            Long turmaId,
            String turma,
            String serie,
            Long disciplinaId,
            String disciplina,
            int alunos,
            int aulasPrevistas,
            int aulasRegistradas,
            BigDecimal frequencia,
            BigDecimal media,
            int avaliacoesLancadas,
            int avaliacoes) {
    }

    /**
     * Segunda a sexta de uma semana do diário. {@code anterior} e {@code proxima}
     * são as segundas-feiras para navegar (nula quando não há para onde ir).
     * Dias depois de hoje trazem as aulas da grade como previstas.
     */
    public record SemanaDto(LocalDate inicio, LocalDate fim, LocalDate anterior, LocalDate proxima,
            List<DiaDiarioDto> dias) {
    }

    public record DiaDiarioDto(LocalDate data, String feriado, List<AulaDiarioDto> aulas) {
    }

    public record AulaDiarioDto(
            Long aulaId,
            Long turmaId,
            String turma,
            String serie,
            String disciplina,
            String horario,
            LocalTime inicio,
            LocalTime fim,
            SituacaoAula situacao,
            String conteudo,
            Integer presentes,
            Integer faltas,
            LocalDateTime registradoEm,
            List<AnotacaoAulaDto> anotacoes) {
    }

    public record AnotacaoAulaDto(Long alunoId, String aluno, String tipo, String tipoDescricao, String observacao) {
    }

    public record AvaliacaoDto(
            Long id,
            String nome,
            String tipo,
            Long turmaId,
            String turma,
            String serie,
            String disciplina,
            LocalDate dataAplicacao,
            LocalDate prazo,
            int alunos,
            int lancadas,
            BigDecimal media,
            SituacaoAvaliacao situacao) {
    }

    public record AnotacaoDto(
            Long id,
            Long alunoId,
            String aluno,
            String matricula,
            String turma,
            String serie,
            String disciplina,
            LocalDate data,
            String tipo,
            String tipoDescricao,
            String observacao) {
    }

    public enum SituacaoAula {
        /** Conteúdo ou chamada lançados. */
        REGISTRADA,
        /** Já aconteceu e nada foi lançado. */
        PENDENTE,
        /** Ainda vai acontecer (ou está acontecendo). */
        PREVISTA
    }

    public enum SituacaoAvaliacao {
        LANCADA,
        NO_PRAZO,
        ATRASADA,
        AGENDADA
    }
}
