package br.com.brain.enums;

import lombok.Getter;

/** Classificação do laudo anexado à ficha médica do aluno. */
@Getter
public enum TipoLaudo {
    NEUROPSICOLOGICO("Neuropsicológico"),
    PSICOLOGICO("Psicológico"),
    PSIQUIATRICO("Psiquiátrico"),
    FONOAUDIOLOGICO("Fonoaudiológico"),
    OFTALMOLOGICO("Oftalmológico"),
    AUDITIVO("Auditivo"),
    ATESTADO_MEDICO("Atestado médico"),
    OUTRO("Outro");

    private final String descricao;

    TipoLaudo(String descricao) {
        this.descricao = descricao;
    }
}
