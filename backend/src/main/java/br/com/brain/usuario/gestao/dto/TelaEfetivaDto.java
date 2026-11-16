package br.com.brain.usuario.gestao.dto;

import java.util.List;

/** Tela que a pessoa abre no perfil, com tudo o que a concede. */
public record TelaEfetivaDto(String codigo, String nome, String rota, String modulo, List<OrigemAcessoDto> origens) {
}
