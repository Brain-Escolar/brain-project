package br.com.brain.dto.professor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.List;

import br.com.brain.dto.dependente.CadastroDependenteDto;
import br.com.brain.dto.endereco.EnderecoDto;

public record CadastroProfessorDto(
        @NotBlank @Pattern(regexp = "\\d{11}") String cpf,
        String rg,
        @NotBlank String nome,
        String nomeSocial,
        @NotBlank @Email String email,
        @NotNull LocalDate dataDeNascimento,
        @NotNull @Valid EnderecoDto endereco,
        String genero,
        String corRaca,
        String cidadeNaturalidade,
        String carteiraDeTrabalho,
        List<String> telefones,
        List<CadastroDependenteDto> dependentes) {
}
