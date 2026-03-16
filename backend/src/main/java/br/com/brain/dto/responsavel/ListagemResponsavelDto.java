package br.com.brain.dto.responsavel;

import br.com.brain.domain.endereco.Endereco;
import br.com.brain.domain.responsavel.Responsavel;

public record ListagemResponsavelDto(
        Long id, String nome, String email, Endereco endereco, String rg, String cpf) {

    public ListagemResponsavelDto(Responsavel responsavel) {
        this(
                responsavel.getId(),
                responsavel.getDadosPessoais().getNome(),
                responsavel.getDadosPessoais().getEmail(),
                responsavel.getDadosPessoais().getEndereco(),
                responsavel.getDadosPessoais().getRg(),
                responsavel.getDadosPessoais().getCpf());
    }
}
