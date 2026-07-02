package br.com.brain.enums;

import lombok.Getter;

@Getter
public enum TipoAvaliacao {
    PROVA("Prova"),
    TRABALHO("Trabalho"),
    LISTA("Lista"),
    SEMINARIO("Seminário"),
    RECUPERACAO("Recuperação");

    private final String descricao;

    TipoAvaliacao(String descricao) {
        this.descricao = descricao;
    }
}
