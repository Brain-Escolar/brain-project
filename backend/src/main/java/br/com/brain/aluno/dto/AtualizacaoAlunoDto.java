package br.com.brain.aluno.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.List;

import br.com.brain.endereco.dto.EnderecoDto;
import br.com.brain.responsavel.dto.CadastroResponsavelDto;

public record AtualizacaoAlunoDto(
        String nome,
        LocalDate dataDeNascimento,
        @Email String email,
        @Pattern(regexp = "\\d{11}") String cpf,
        String rg,
        @Valid EnderecoDto endereco,
        List<String> telefones,
        List<CadastroResponsavelDto> responsaveis) {
}
