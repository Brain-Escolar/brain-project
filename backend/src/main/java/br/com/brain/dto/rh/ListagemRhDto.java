package br.com.brain.dto.rh;

import br.com.brain.domain.endereco.Endereco;
import br.com.brain.domain.rh.Rh;

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
