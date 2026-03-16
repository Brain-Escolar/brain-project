package br.com.brain.dto.coordenador;

import jakarta.validation.constraints.Email;
import java.time.LocalDate;

import br.com.brain.dto.endereco.EnderecoDto;

public record AtualizacaoCoordenadorDto(
        String nome,
        String rg,
        LocalDate dataDeNascimento,
        @Email String email,
        EnderecoDto endereco,
        String carteiraDeTrabalho) {
}
