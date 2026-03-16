package br.com.brain.dto.perfil;

import br.com.brain.domain.perfil.Perfil;

public record ListagemPerfilDto(String perfilNome) {

    public ListagemPerfilDto(Perfil perfil) {
        this(perfil.getNome().toString());
    }
}
