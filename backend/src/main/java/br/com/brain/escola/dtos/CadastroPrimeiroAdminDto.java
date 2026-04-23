package br.com.brain.escola.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CadastroPrimeiroAdminDto(
        @NotBlank String nome,
        @NotBlank String email,
        @NotBlank String senha,
        @NotBlank String cpf,
        @NotNull LocalDate dataDeNascimento,
        @NotBlank String logradouro,
        @NotBlank String bairro,
        @NotBlank String cep,
        @NotBlank String uf,
        @NotBlank String cidade,
        String complemento,
        String numero
) {}
