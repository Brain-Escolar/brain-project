package br.com.brain.enums;

import lombok.Getter;

/**
 * Como a medicação é administrada. PERIODO exige data de início e fim;
 * CONTINUO indica uso sem previsão de término.
 */
@Getter
public enum TipoUsoMedicacao {
    PERIODO("Período determinado"),
    CONTINUO("Uso contínuo");

    private final String descricao;

    TipoUsoMedicacao(String descricao) {
        this.descricao = descricao;
    }
}
