package br.com.brain.shared.enums;

import lombok.Getter;

@Getter
public enum Turno {
    MATUTINO("Matutino"),
    VESPERTINO("Vespertino"),
    NOTURNO("Noturno"),
    INTEGRAL("Integral");

    private String tipo;

    Turno(String tipo) {
        this.tipo = tipo;
    }
}
