package br.com.brain.responsavel.dtos;

import br.com.brain.shared.endereco.EnderecoDto;
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
