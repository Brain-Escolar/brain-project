package br.com.brain.diretor.projecao;

/** Chamadas da escola num mês: quantas foram registradas e em quantas o aluno estava presente. */
public record FrequenciaMensal(Integer ano, Integer mes, Long chamadas, Long presencas) {
}
