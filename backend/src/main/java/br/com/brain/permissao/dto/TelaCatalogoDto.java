package br.com.brain.permissao.dto;

import java.util.List;

/**
 * Tela do catálogo. doPerfil é falso só no catálogo do acesso individual,
 * para as telas de fora do teto do perfil (a tela mostra "De outro perfil").
 * modulo é nulo para tela sem módulo.
 */
public record TelaCatalogoDto(
        String codigo,
        String nome,
        String rota,
        ModuloDto modulo,
        boolean exibirMenu,
        boolean doPerfil,
        List<ControleCatalogoDto> controles) {
}
