package br.com.brain.secretario.dto;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.endereco.dto.EnderecoDto;

public record AtualizacaoSecretarioDto(
        String nome,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco) {
}
