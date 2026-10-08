package br.com.brain.permissao.dto;

import java.util.List;

public record TelaCatalogoDto(
        String codigo,
        String nome,
        String rota,
        boolean exibirMenu,
        List<ControleCatalogoDto> controles) {
}
