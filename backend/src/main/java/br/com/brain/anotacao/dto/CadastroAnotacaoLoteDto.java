package br.com.brain.anotacao.dto;

import br.com.brain.enums.Anotacoes;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CadastroAnotacaoLoteDto(
        @NotEmpty(message = "Informe ao menos um aluno") List<Long> alunoIds,
        @NotNull(message = "ID da aula é obrigatório") Long aulaId,
        @NotNull(message = "Tipo de anotação é obrigatório") Anotacoes tipoAnotacao,
        @NotNull(message = "Data da anotação é obrigatória") LocalDate data,
        String observacao) {
}
