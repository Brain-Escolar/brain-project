package br.com.brain.matricula.dto;

/** O que o encerramento do ano vai fazer, para a direção confirmar antes. */
public record PreviaEncerramentoDto(
        int ano,
        /** Matrículas efetivadas com turma: ganham resultado final e viram CONCLUIDA. */
        long matriculasAConcluir,
        /** Efetivadas sem turma: viram CONCLUIDA sem resultado. */
        long matriculasSemTurma,
        /** Pré-matrículas nunca efetivadas: são canceladas. */
        long preMatriculas,
        /** Períodos ainda abertos: são fechados. */
        long periodosAbertos) {
}
