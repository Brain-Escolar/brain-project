package br.com.brain.avaliacao.dtos;

public class AvaliacoesDto {
    private Long id;
    private String nome;

    public AvaliacoesDto(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }
}
