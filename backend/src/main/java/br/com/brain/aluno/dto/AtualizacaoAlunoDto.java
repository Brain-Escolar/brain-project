package br.com.brain.aluno.dto;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.endereco.dto.EnderecoDto;

public record AtualizacaoAlunoDto(
        String nome,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco) {
}
