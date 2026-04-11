package br.com.brain.enums;

import lombok.Getter;

@Getter
public enum TipoEvento {
    PROVA("Prova"),
    ENTREGA_PROVA("Entrega de Prova"),
    ENTREGA_NOTAS("Entrega de Notas"),
    REUNIAO("Reunião"),
    FERIADO("Feriado"),
    OUTRO("Outro");

    private final String descricao;

    TipoEvento(String descricao) {
        this.descricao = descricao;
    }
}
