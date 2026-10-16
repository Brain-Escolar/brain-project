package br.com.brain.diretor.projecao;

/** Média das notas regulares lançadas para as turmas de uma série. */
public record MediaPorSerie(Long serieId, String serie, Double media) {
}
