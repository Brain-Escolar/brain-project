package br.com.brain.medicacao.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Inclusao ou edicao de medicacao em uso.
 *
 * Só o nome e obrigatorio: a familia nem sempre sabe a dosagem exata na hora
 * do cadastro, e exigir o campo levaria a dado inventado numa ficha de saude.
 * Tipo de uso e periodo sao preenchidos pela Orientacao; o portal nao os envia.
 */
public record CadastroMedicacaoDto(
        @NotBlank @Size(max = 255) String nome,
        @Size(max = 255) String dosagem,
        @Size(max = 255) String horario,
        @Size(max = 500) String observacao,
        String tipoUso,
        LocalDate dataInicio,
        LocalDate dataFim) {
}
