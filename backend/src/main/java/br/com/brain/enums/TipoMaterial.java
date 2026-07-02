package br.com.brain.enums;

import lombok.Getter;

@Getter
public enum TipoMaterial {
    ARQUIVO("Arquivo"),
    LINK("Link");

    private final String descricao;

    TipoMaterial(String descricao) {
        this.descricao = descricao;
    }
}
