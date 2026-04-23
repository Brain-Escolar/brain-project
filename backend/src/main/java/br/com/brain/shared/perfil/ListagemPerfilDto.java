package br.com.brain.shared.perfil;

import br.com.brain.shared.perfil.Perfil;

public record ListagemPerfilDto(String perfilNome) {

    public ListagemPerfilDto(Perfil perfil) {
        this(perfil.getNome().toString());
    }
}
