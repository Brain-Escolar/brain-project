package br.com.brain.dto.serie;

public class SerieDto {
    private Long id;
    private String nome;

    public SerieDto(Long id, String nome) {
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
