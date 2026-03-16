package br.com.brain.dto.secretario;

import br.com.brain.domain.endereco.Endereco;
import br.com.brain.domain.secretario.Secretario;

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
