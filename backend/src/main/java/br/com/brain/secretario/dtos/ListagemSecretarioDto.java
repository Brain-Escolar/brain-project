package br.com.brain.secretario.dtos;

import br.com.brain.shared.endereco.Endereco;
import br.com.brain.secretario.domain.Secretario;

public record ListagemSecretarioDto(
        Long id,
        String cpf,
        String nome,
        String email,
        String emailProfissional,
        Endereco endereco,
        String rg,
        String carteiraDeTrabalho) {

    public ListagemSecretarioDto(Secretario secretario) {
        this(
                secretario.getId(),
                secretario.getDadosPessoais().getCpf(),
                secretario.getDadosPessoais().getNome(),
                secretario.getDadosPessoais().getEmail(),
                secretario.getDadosPessoais().getEmailProfissional(),
                secretario.getDadosPessoais().getEndereco(),
                secretario.getDadosPessoais().getRg(),
                secretario.getDadosPessoais().getCarteiraDeTrabalho());
    }
}
