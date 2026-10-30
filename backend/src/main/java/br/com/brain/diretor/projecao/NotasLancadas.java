package br.com.brain.diretor.projecao;

/** Notas já lançadas numa avaliação de turma e a média delas. */
public record NotasLancadas(Long avaliacaoTurmaId, Long lancadas, Double media) {
}
