package br.com.brain.diretor.projecao;

/** Chamadas de um aluno numa disciplina, somadas num intervalo de datas. */
public record FrequenciaAgregada(Long alunoId, Long disciplinaId, Long aulas, Long faltas) {
}
