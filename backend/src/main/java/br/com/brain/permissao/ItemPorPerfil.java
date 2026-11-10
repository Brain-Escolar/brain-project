package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;

/** Código de tela ou controle concedido por um grupo do perfil. */
public record ItemPorPerfil(PerfilNome perfil, String codigo) {
}
