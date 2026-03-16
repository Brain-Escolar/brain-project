package br.com.brain.enums;

import java.util.Arrays;

public enum Avaliacoes {
    P_1(1L, "Prova 1"),
    P_2(2L, "Prova 2"),
    P_3(3L, "Prova 3"),
    P_4(4L, "Prova 4"),
    P_5(5L, "Prova 5"),
    P_SUB(6L, "Prova Substitutiva"),
    TESTE1(7L, "Teste 1"),
    TESTE2(8L, "Teste 2"),
    TESTE3(9L, "Teste 3"),
    TESTE4(10L, "Teste 4"),
    TESTE5(11L, "Teste 5"),
    TESTE_SUB(12L, "Teste Substitutivo"),
    ;

    private final Long id;
    private final String nome;

    Avaliacoes(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    public Long getId() {
        return id;
    }

    public static String getNomeById(Long id) {
        return Arrays.stream(Avaliacoes.values())
                .filter(avaliacao -> avaliacao.getId().equals(id))
                .map(Avaliacoes::getNome)
                .findFirst()
                .orElse(null);
    }
}
