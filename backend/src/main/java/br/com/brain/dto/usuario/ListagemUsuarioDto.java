package br.com.brain.dto.usuario;

import br.com.brain.domain.autenticacao.DadosAutenticacao;

public record ListagemUsuarioDto(Long id, String username) {
    public ListagemUsuarioDto(DadosAutenticacao usuario) {
        this(usuario.getId(), usuario.getEmail());
    }
}
