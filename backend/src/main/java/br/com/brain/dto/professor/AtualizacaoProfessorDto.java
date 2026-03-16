package br.com.brain.dto.professor;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.dto.endereco.EnderecoDto;

public record AtualizacaoProfessorDto(
        String nome,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco) {
}
