package br.com.brain.permissao.dto;

import br.com.brain.permissao.Tela;

/**
 * Tela do catálogo, só o essencial: a busca da aba "Por tela", que agrupa por
 * módulo, e os dados das telas liberadas em GET /permissoes/me.
 */
public record TelaResumoDto(String codigo, String nome, String rota, boolean exibirMenu, ModuloDto modulo) {

    public static TelaResumoDto de(Tela tela) {
        return new TelaResumoDto(tela.getCodigo(), tela.getNome(), tela.getRota(),
                Boolean.TRUE.equals(tela.getExibirMenu()), ModuloDto.de(tela.getModulo()));
    }
}
