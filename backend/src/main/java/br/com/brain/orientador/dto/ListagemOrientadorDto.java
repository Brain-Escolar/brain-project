package br.com.brain.orientador.dto;

import br.com.brain.endereco.models.Endereco;
import br.com.brain.orientador.models.Orientador;

public record ListagemOrientadorDto(
        Long id,
        String cpf,
        String nome,
        String email,
        String emailProfissional,
        Endereco endereco,
        String rg,
        String carteiraDeTrabalho) {

    public ListagemOrientadorDto(Orientador orientador) {
        this(
                orientador.getId(),
                orientador.getDadosPessoais().getCpf(),
                orientador.getDadosPessoais().getNome(),
                orientador.getDadosPessoais().getEmail(),
                orientador.getDadosPessoais().getEmailProfissional(),
                orientador.getDadosPessoais().getEndereco(),
                orientador.getDadosPessoais().getRg(),
                orientador.getDadosPessoais().getCarteiraDeTrabalho());
    }
}
