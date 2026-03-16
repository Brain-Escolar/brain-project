package br.com.brain.dto.diretor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

import br.com.brain.dto.endereco.EnderecoDto;

public record CadastroDiretorDto(
        @NotBlank @Pattern(regexp = "\\d{11}") String cpf,
        String rg,
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotNull LocalDate dataDeNascimento,
        @NotNull @Valid EnderecoDto endereco,
        String carteiraDeTrabalho) {
}
