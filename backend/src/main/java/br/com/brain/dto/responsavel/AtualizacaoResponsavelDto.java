package br.com.brain.dto.responsavel;

import br.com.brain.dto.endereco.EnderecoDto;
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
