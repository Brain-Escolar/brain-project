package br.com.brain.professor.dto;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.endereco.dto.EnderecoDto;

public record AtualizacaoProfessorDto(
        String nome,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco) {
}
