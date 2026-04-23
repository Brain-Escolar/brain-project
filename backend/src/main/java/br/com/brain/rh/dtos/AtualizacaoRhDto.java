package br.com.brain.rh.dtos;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.shared.endereco.EnderecoDto;

public record AtualizacaoRhDto(
        String nome,
        String rg,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco,
        String carteiraDeTrabalho) {
}
