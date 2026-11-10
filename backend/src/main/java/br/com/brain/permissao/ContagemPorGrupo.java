package br.com.brain.permissao;

/** Resultado das contagens agrupadas por grupo (telas, controles, membros). */
public record ContagemPorGrupo(Long grupoId, Long quantidade) {
}
