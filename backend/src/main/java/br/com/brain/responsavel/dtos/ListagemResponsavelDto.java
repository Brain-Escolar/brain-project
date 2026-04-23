package br.com.brain.responsavel.dtos;

import br.com.brain.shared.endereco.Endereco;
import br.com.brain.responsavel.domain.Responsavel;

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
