package br.com.brain.usuario.gestao.dto;

/** Seções da página da pessoa que quem vê pode abrir, além de cabeçalho e login. */
public record SecoesDto(boolean acessoEfetivo, boolean perfis) {
}
