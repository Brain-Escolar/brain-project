package br.com.brain.diretor.dtos;

import br.com.brain.diretor.domain.Diretor;
import br.com.brain.shared.endereco.Endereco;

public record ListagemDiretorDto(
        Long id,
        String cpf,
        String nome,
        String email,
        String emailProfissional,
        Endereco endereco,
        String rg,
        String carteiraDeTrabalho) {

    public ListagemDiretorDto(Diretor diretor) {
        this(
                diretor.getId(),
                diretor.getDadosPessoais().getCpf(),
                diretor.getDadosPessoais().getNome(),
                diretor.getDadosPessoais().getEmail(),
                diretor.getDadosPessoais().getEmailProfissional(),
                diretor.getDadosPessoais().getEndereco(),
                diretor.getDadosPessoais().getRg(),
                diretor.getDadosPessoais().getCarteiraDeTrabalho());
    }
}
