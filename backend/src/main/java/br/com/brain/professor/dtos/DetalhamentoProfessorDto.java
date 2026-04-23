package br.com.brain.professor.dtos;

import br.com.brain.shared.endereco.Endereco;
import br.com.brain.professor.domain.Professor;

import java.time.LocalDate;
import java.util.List;

public record DetalhamentoProfessorDto(
        Long id,
        String nome,
        String nomeSocial,
        String email,
        LocalDate dataDeNascimento,
        String genero,
        String corRaca,
        String cidadeNaturalidade,
        String cpf,
        String rg,
        String carteiraDeTrabalho,
        Endereco endereco,
        List<String> telefones) {

    public DetalhamentoProfessorDto(Professor professor) {
        this(
                professor.getId(),
                professor.getDadosPessoais().getNome(),
                professor.getDadosPessoais().getNomeSocial(),
                professor.getDadosPessoais().getEmail(),
                professor.getDadosPessoais().getDataDeNascimento(),
                professor.getDadosPessoais().getGenero(),
                professor.getDadosPessoais().getCorRaca(),
                professor.getDadosPessoais().getCidadeNaturalidade(),
                professor.getDadosPessoais().getCpf(),
                professor.getDadosPessoais().getRg(),
                professor.getDadosPessoais().getCarteiraDeTrabalho(),
                professor.getDadosPessoais().getEndereco(),
                professor.getDadosPessoais().getTelefones().stream().map(t -> t.getNumero()).toList());
    }
}
