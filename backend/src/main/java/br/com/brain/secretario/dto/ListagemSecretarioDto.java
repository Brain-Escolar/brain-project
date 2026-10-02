package br.com.brain.secretario.dto;

import br.com.brain.endereco.Endereco;
import br.com.brain.secretario.Secretario;

public record ListagemSecretarioDto(
        Long id,
        Long dadosPessoaisId,
        String cpf,
        String nome,
        String nomeSocial,
        String email,
        String emailProfissional,
        Endereco endereco,
        String rg,
        String carteiraDeTrabalho) {

    public ListagemSecretarioDto(Secretario secretario) {
        this(
                secretario.getId(),
                secretario.getDadosPessoais().getId(),
                secretario.getDadosPessoais().getCpf(),
                secretario.getDadosPessoais().getNome(),
                secretario.getDadosPessoais().getNomeSocial(),
                secretario.getDadosPessoais().getEmail(),
                secretario.getDadosPessoais().getEmailProfissional(),
                secretario.getDadosPessoais().getEndereco(),
                secretario.getDadosPessoais().getRg(),
                secretario.getDadosPessoais().getCarteiraDeTrabalho());
    }
}
