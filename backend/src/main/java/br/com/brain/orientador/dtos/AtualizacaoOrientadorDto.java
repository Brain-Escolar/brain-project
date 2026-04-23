package br.com.brain.orientador.dtos;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.shared.endereco.EnderecoDto;

public record AtualizacaoOrientadorDto(
        String nome,
        String rg,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco,
        String carteiraDeTrabalho) {
}
