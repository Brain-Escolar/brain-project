package br.com.brain.professor.dtos;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.shared.endereco.EnderecoDto;

public record AtualizacaoProfessorDto(
        String nome,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco) {
}
