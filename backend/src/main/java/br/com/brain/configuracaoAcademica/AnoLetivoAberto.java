package br.com.brain.configuracaoAcademica;

/**
 * Um ano passou a ser o corrente. Publicado dentro da transação de abertura:
 * quem guarda algo "do ano corrente" (o cache de turma em alunos) se acerta
 * junto, ou nada acontece.
 */
public record AnoLetivoAberto(int ano) {
}
