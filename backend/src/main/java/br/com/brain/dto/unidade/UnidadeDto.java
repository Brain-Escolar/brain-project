package br.com.brain.dto.unidade;

public class UnidadeDto {
    private Long id;
    private String nome;

    public UnidadeDto(Long id, String nome) {
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
