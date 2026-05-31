package br.com.brain.perfil.dto;

import br.com.brain.perfil.models.Perfil;

public record ListagemPerfilDto(String perfilNome) {

    public ListagemPerfilDto(Perfil perfil) {
        this(perfil.getNome().toString());
    }
}
