package br.com.brain.avaliacao.dto;

import java.math.BigDecimal;
import java.util.List;

import br.com.brain.enums.TipoAvaliacao;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CadastroAvaliacaoDto(
        @NotBlank String nome,
        @NotNull Long disciplinaId,
        @NotNull TipoAvaliacao tipo,
        @NotNull BigDecimal notaMaxima,
        String conteudo,
        Boolean notaExtra,
        @NotEmpty @Valid List<CadastroAvaliacaoTurmaDto> turmas) {
}
