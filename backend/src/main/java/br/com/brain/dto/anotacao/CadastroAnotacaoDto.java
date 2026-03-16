package br.com.brain.dto.anotacao;

import java.time.LocalDate;

import br.com.brain.enums.Anotacoes;
import jakarta.validation.constraints.NotNull;

public record CadastroAnotacaoDto(
        @NotNull(message = "ID do aluno é obrigatório") Long alunoId,
        @NotNull(message = "ID da aula é obrigatório") Long aulaId,
        @NotNull(message = "Tipo de anotação é obrigatório") Anotacoes tipoAnotacao,
        @NotNull(message = "Data da anotação é obrigatória") LocalDate data,
        String observacao) {
}
