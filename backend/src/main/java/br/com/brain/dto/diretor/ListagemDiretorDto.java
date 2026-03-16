package br.com.brain.dto.diretor;

import br.com.brain.domain.diretor.Diretor;
import br.com.brain.domain.endereco.Endereco;

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
