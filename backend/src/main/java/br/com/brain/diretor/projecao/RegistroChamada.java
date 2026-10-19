package br.com.brain.diretor.projecao;

import java.time.Instant;
import java.time.LocalDate;

/** Chamada de uma aula num dia: quantos alunos foram chamados, quantos faltaram e quando foi lançada. */
public record RegistroChamada(Long aulaId, LocalDate data, Long alunos, Long faltas, Instant registradoEm) {
}
