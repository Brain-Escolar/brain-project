package br.com.brain.dto.aluno;

import br.com.brain.enums.CursoPretendido;

public record CursoPretendidoDto(String nome, String descricao) {

    public CursoPretendidoDto(CursoPretendido curso) {
        this(curso.name(), curso.getDescricao());
    }
}
