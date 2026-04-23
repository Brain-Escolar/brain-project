package br.com.brain.rh.dtos;

import br.com.brain.shared.endereco.Endereco;
import br.com.brain.rh.domain.Rh;

public record ListagemRhDto(
        Long id,
        String cpf,
        String nome,
        String email,
        String emailProfissional,
        Endereco endereco,
        String rg,
        String carteiraDeTrabalho) {

    public ListagemRhDto(Rh rh) {
        this(
                rh.getId(),
                rh.getDadosPessoais().getCpf(),
                rh.getDadosPessoais().getNome(),
                rh.getDadosPessoais().getEmail(),
                rh.getDadosPessoais().getEmailProfissional(),
                rh.getDadosPessoais().getEndereco(),
                rh.getDadosPessoais().getRg(),
                rh.getDadosPessoais().getCarteiraDeTrabalho());
    }
}
