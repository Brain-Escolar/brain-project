package br.com.brain.diretor.painel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Acompanhamento de uma turma num recorte (um período ou o acumulado do ano,
 * todas as disciplinas ou uma). Toda a conta — médias, frequência, atrasos e
 * quem está "em atenção" — é feita aqui; o front só ordena, busca e exibe.
 *
 * <p>Os campos de cada aluno seguem o recorte de disciplina; {@code geral},
 * {@code atrasos} e {@code motivosAtencao} consideram sempre todas as
 * disciplinas, porque "em atenção" é uma leitura do aluno, não da matéria.
 */
public record AcompanhamentoTurmaDto(
        TurmaDto turma,
        String periodo,
        Long disciplinaId,
        CriteriosDto criterios,
        List<DisciplinaOpcaoDto> disciplinas,
        ResumoDto resumo,
        List<AlunoDto> alunos,
        List<DisciplinaDto> desempenhoDisciplinas,
        List<AnotacaoDto> anotacoes) {

    public record TurmaDto(
            Long id,
            String nome,
            String serie,
            String unidade,
            String turno,
            String sala,
            int totalAlunos) {
    }

    /** Limites usados para marcar um aluno "em atenção", já multiplicados pelos períodos do recorte. */
    public record CriteriosDto(
            BigDecimal mediaMinima,
            BigDecimal frequenciaMinima,
            int atrasosPorPeriodo,
            int anotacoesPorPeriodo,
            int periodosConsiderados) {
    }

    public record DisciplinaOpcaoDto(Long id, String nome) {
    }

    public record ResumoDto(
            BigDecimal mediaTurma,
            int alunosAbaixoMedia,
            BigDecimal frequenciaMedia,
            int alunosAbaixoFrequencia,
            int totalAtrasos,
            int alunosComAtrasosRecorrentes,
            int totalAnotacoes,
            int alunosComAnotacoes,
            int alunosEmAtencao) {
    }

    public record AlunoDto(
            Long id,
            String nome,
            String matricula,
            BigDecimal media,
            int faltas,
            BigDecimal frequencia,
            int anotacoes,
            GeralDto geral,
            int atrasos,
            List<LocalDate> datasAtrasos,
            List<String> motivosAtencao,
            List<NotaDisciplinaDto> disciplinas) {
    }

    /** Números do aluno em todas as disciplinas, independente do recorte. */
    public record GeralDto(
            BigDecimal media,
            int disciplinasAbaixo,
            int faltas,
            BigDecimal frequencia,
            int anotacoes) {
    }

    public record NotaDisciplinaDto(Long disciplinaId, String nome, BigDecimal media, int faltas, int aulas) {
    }

    public record DisciplinaDto(
            Long id,
            String nome,
            String professor,
            BigDecimal media,
            int alunosAbaixo,
            int alunosComNota,
            int faltas,
            BigDecimal frequencia,
            int anotacoes) {
    }

    /** Anotação de comportamento (atrasos ficam de fora: são contados à parte). */
    public record AnotacaoDto(
            Long id,
            Long alunoId,
            String aluno,
            LocalDate data,
            String tipo,
            String tipoDescricao,
            Long disciplinaId,
            String disciplina,
            String professor,
            String observacao) {
    }
}
