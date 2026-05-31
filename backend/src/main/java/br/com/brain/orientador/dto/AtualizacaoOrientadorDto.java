package br.com.brain.orientador.dto;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.endereco.dto.EnderecoDto;

public record AtualizacaoOrientadorDto(
        String nome,
        String rg,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco,
        String carteiraDeTrabalho) {
}
