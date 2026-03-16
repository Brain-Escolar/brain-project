package br.com.brain.dto.aluno;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.dto.endereco.EnderecoDto;

public record AtualizacaoAlunoDto(
        String nome,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco) {
}
