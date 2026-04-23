package br.com.brain.usuario.dtos;

import br.com.brain.autenticacao.domain.DadosAutenticacao;

public record ListagemUsuarioDto(Long id, String username) {
    public ListagemUsuarioDto(DadosAutenticacao usuario) {
        this(usuario.getId(), usuario.getEmail());
    }
}
