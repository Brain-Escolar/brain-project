package br.com.brain.responsavel.dto;

import br.com.brain.endereco.dto.EnderecoDto;
import jakarta.validation.constraints.Email;
import java.time.LocalDate;
import java.util.List;

public record AtualizacaoResponsavelDto(
        String nome,
        String cpf,
        @Email String email,
        LocalDate dataDeNascimento,
        EnderecoDto endereco,
        Boolean financeiro,
        List<String> telefones) {
}
