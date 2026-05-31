package br.com.brain.usuario.dto;

import br.com.brain.autenticacao.models.DadosAutenticacao;

public record ListagemUsuarioDto(Long id, String username) {
    public ListagemUsuarioDto(DadosAutenticacao usuario) {
        this(usuario.getId(), usuario.getEmail());
    }
}
