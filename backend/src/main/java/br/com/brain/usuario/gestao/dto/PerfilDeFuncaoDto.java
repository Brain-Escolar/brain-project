package br.com.brain.usuario.gestao.dto;

import br.com.brain.enums.PerfilNome;

/**
 * Uma linha da seção Perfis. tem diz se a pessoa já tem o perfil; podeAlterar,
 * se quem vê pode conceder (quando não tem) ou remover (quando tem). Quando
 * não pode, bloqueio explica por quê. ESTUDANTE, RESPONSAVEL e PROFESSOR
 * aparecem sem ação: vêm dos cadastros de origem (RU6).
 */
public record PerfilDeFuncaoDto(PerfilNome perfil, boolean tem, boolean podeAlterar, String bloqueio) {
}
