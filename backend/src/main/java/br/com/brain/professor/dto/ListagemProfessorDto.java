package br.com.brain.professor.dto;

import br.com.brain.endereco.Endereco;
import br.com.brain.professor.Professor;

public record ListagemProfessorDto(
        Long id,
        String cpf,
        String matricula,
        String nome,
        String nomeSocial,
        String email,
        String emailProfissional,
        Endereco endereco,
        String rg,
        String carteiraDeTrabalho) {

    public ListagemProfessorDto(Professor professor) {
        this(
                professor.getId(),
                professor.getDadosPessoais().getCpf(),
                professor.getDadosPessoais().getMatricula(),
                professor.getDadosPessoais().getNome(),
                professor.getDadosPessoais().getNomeSocial(),
                professor.getDadosPessoais().getEmail(),
                professor.getDadosPessoais().getEmailProfissional(),
                professor.getDadosPessoais().getEndereco(),
                professor.getDadosPessoais().getRg(),
                professor.getDadosPessoais().getCarteiraDeTrabalho());
    }
}
