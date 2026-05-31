package br.com.brain.usuario.dto;

import br.com.brain.autenticacao.DadosAutenticacao;

public record ListagemUsuarioDto(Long id, String username) {
    public ListagemUsuarioDto(DadosAutenticacao usuario) {
        this(usuario.getId(), usuario.getEmail());
    }
}
