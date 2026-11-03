package br.com.brain.dadosPessoais.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.endereco.Endereco;

/**
 * Pessoa que ja existe em dados_pessoais, vista por quem esta cadastrando.
 *
 * Alimenta o aviso "esta pessoa ja e Responsavel no sistema" e o
 * preenchimento automatico do formulario. Os vinculos vem das tabelas de
 * ator (professores, responsaveis...), e nao de perfis: um aluno-lead do CRM
 * nao tem login nem perfil, mas ja e aluno.
 */
public record PessoaExistenteDto(
        Long id,
        String cpf,
        String rg,
        String nome,
        String nomeSocial,
        String email,
        LocalDate dataDeNascimento,
        String genero,
        String corRaca,
        String cidadeNaturalidade,
        String carteiraDeTrabalho,
        Endereco endereco,
        List<String> telefones,
        List<Vinculo> vinculos) {

    /** ativo=false so para professor desligado, que se reativa em vez de recadastrar. */
    public record Vinculo(String tipo, String descricao, boolean ativo) {
    }

    public PessoaExistenteDto(DadosPessoais dp) {
        this(
                dp.getId(),
                dp.getCpf(),
                dp.getRg(),
                dp.getNome(),
                dp.getNomeSocial(),
                dp.getEmail(),
                dp.getDataDeNascimento(),
                dp.getGenero(),
                dp.getCorRaca(),
                dp.getCidadeNaturalidade(),
                dp.getCarteiraDeTrabalho(),
                dp.getEndereco(),
                dp.getTelefonesNumeros(),
                vinculosDe(dp));
    }

    private static List<Vinculo> vinculosDe(DadosPessoais dp) {
        var vinculos = new ArrayList<Vinculo>();
        if (dp.getAluno() != null) {
            vinculos.add(new Vinculo("ALUNO", "Aluno", true));
        }
        if (dp.getResponsavel() != null) {
            vinculos.add(new Vinculo("RESPONSAVEL", "Responsável", true));
        }
        if (dp.getProfessor() != null) {
            vinculos.add(new Vinculo("PROFESSOR", "Professor", !Boolean.FALSE.equals(dp.getProfessor().getAtivo())));
        }
        if (dp.getSecretario() != null) {
            vinculos.add(new Vinculo("SECRETARIO", "Secretaria", true));
        }
        if (dp.getDiretor() != null) {
            vinculos.add(new Vinculo("DIRETOR", "Direção", true));
        }
        if (dp.getCoordenador() != null) {
            vinculos.add(new Vinculo("COORDENADOR", "Coordenação", true));
        }
        if (dp.getOrientador() != null) {
            vinculos.add(new Vinculo("ORIENTADOR", "Orientação", true));
        }
        if (dp.getRh() != null) {
            vinculos.add(new Vinculo("RH", "Recursos Humanos", true));
        }
        return vinculos;
    }
}
