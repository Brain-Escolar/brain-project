package br.com.brain.diretor.dtos;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.shared.endereco.EnderecoDto;

public record AtualizacaoDiretorDto(
        String nome,
        String rg,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco,
        String carteiraDeTrabalho) {
}
