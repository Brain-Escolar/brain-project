package br.com.brain.shared.enums;

public enum Anotacoes {
    DEVER_DE_CASA("Não entregou o dever de casa"),
    CONVERSA("Conversa em sala de aula"),
    ATRASO("Atraso"),
    NAO_FEZ_ATIVIDADE("Não fez a atividade"),
    ENTREGA_DE_TRABALHO("Não entregou o trabalho"),
    SEM_MATERIAIS("Sem materiais"),
    OUTROS("Outros");

    private final String descricao;

    Anotacoes(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
