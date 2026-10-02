package br.com.brain.aluno.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.List;

import br.com.brain.endereco.dto.EnderecoDto;
import br.com.brain.responsavel.dto.CadastroResponsavelDto;

public record CadastroAlunoDto(
        @Pattern(regexp = "\\d{11}") String cpf,
        String rg,
        @NotBlank String nome,
        String nomeSocial,
        @NotBlank @Email String email,
        LocalDate dataDeNascimento,
        @Valid EnderecoDto endereco,
        String genero,
        String corRaca,
        String cidadeNaturalidade,
        List<String> telefones,
        
        List<CadastroResponsavelDto> responsaveis
        ) {
}
