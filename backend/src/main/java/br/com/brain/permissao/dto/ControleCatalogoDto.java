package br.com.brain.permissao.dto;

/**
 * Controle do catálogo. doPerfil como na tela; sensivel marca os controles de
 * dado sensível (ControlesSensiveis), que a tela mostra com um aviso.
 */
public record ControleCatalogoDto(String codigo, String nome, String descricao, boolean doPerfil,
        boolean sensivel) {
}
