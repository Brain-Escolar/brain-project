package br.com.brain.usuario.dto;

import br.com.brain.usuario.LinkDeSenhaService.Finalidade;

/** O que a página pública de nova senha mostra antes de a pessoa digitar. */
public record InformacaoLinkSenhaDto(Finalidade finalidade, String nome, String login) {
}
