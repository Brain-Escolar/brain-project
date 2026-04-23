package br.com.brain.aluno.dtos;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.shared.endereco.EnderecoDto;

public record AtualizacaoAlunoDto(
        String nome,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco) {
}
