package br.com.brain.matricula.dto;

public record EncerramentoAnoDto(
        int ano,
        int concluidas,
        int aprovadas,
        int reprovadas,
        /** Faltou nota em alguma disciplina: situação final EM_ANDAMENTO. */
        int semResultado,
        int preMatriculasCanceladas) {
}
