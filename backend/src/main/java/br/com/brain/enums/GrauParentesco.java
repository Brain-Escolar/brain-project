package br.com.brain.enums;

import lombok.Getter;

@Getter
public enum GrauParentesco {
    CONJUGE("Cônjuge"),
    COMPANHEIRO("Companheiro(a)"),
    FILHO("Filho(a)"),
    ENTEADO("Enteado(a)"),
    PAI("Pai"),
    MAE("Mãe"),
    IRMAO("Irmão/Irmã"),
    OUTRO("Outro");

    private final String descricao;

    GrauParentesco(String descricao) {
        this.descricao = descricao;
    }
}
