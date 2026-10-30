package br.com.brain.permissao.dto;

/** Tela do catálogo, só o essencial para a busca da aba "Por tela", que agrupa por módulo. */
public record TelaResumoDto(String codigo, String nome, String rota, ModuloDto modulo) {
}
