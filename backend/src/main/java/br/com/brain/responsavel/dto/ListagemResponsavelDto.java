package br.com.brain.responsavel.dto;

import br.com.brain.endereco.Endereco;
import br.com.brain.responsavel.Responsavel;

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
