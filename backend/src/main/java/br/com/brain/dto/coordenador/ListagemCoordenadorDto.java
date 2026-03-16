package br.com.brain.dto.coordenador;

import br.com.brain.domain.coordenador.Coordenador;
import br.com.brain.domain.endereco.Endereco;

public record ListagemCoordenadorDto(
        Long id,
        String cpf,
        String nome,
        String email,
        String emailProfissional,
        Endereco endereco,
        String rg,
        String carteiraDeTrabalho) {

    public ListagemCoordenadorDto(Coordenador coordenador) {
        this(
                coordenador.getId(),
                coordenador.getDadosPessoais().getCpf(),
                coordenador.getDadosPessoais().getNome(),
                coordenador.getDadosPessoais().getEmail(),
                coordenador.getDadosPessoais().getEmailProfissional(),
                coordenador.getDadosPessoais().getEndereco(),
                coordenador.getDadosPessoais().getRg(),
                coordenador.getDadosPessoais().getCarteiraDeTrabalho());
    }
}
