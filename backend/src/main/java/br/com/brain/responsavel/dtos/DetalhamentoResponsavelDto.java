package br.com.brain.responsavel.dtos;

import java.util.List;

import br.com.brain.shared.endereco.Endereco;
import br.com.brain.responsavel.domain.Responsavel;

public record DetalhamentoResponsavelDto(String nome, String email, Endereco endereco, List<String> alunos) {

    public DetalhamentoResponsavelDto(Responsavel responsavel) {
        this(responsavel.getDadosPessoais().getNome(), responsavel.getDadosPessoais().getEmail(),
                responsavel.getDadosPessoais().getEndereco(), responsavel.getAlunos().stream()
                        .map(aluno -> aluno.getDadosPessoais().getNome()).toList());
    }
}
