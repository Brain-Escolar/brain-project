package br.com.brain.responsavel.portal.dto;

import br.com.brain.responsavel.Responsavel;

import java.util.List;

/**
 * Payload de sessao do Portal do Responsavel: quem esta logado, o que ele pode
 * ver e quais alunos estao sob a sua responsabilidade.
 *
 * O front usa acessoFinanceiro para decidir se o item "Financeiro" aparece no
 * menu - mas a decisao real e do backend, no AcessoFinanceiro do guard.
 */
public record ResponsavelLogadoDto(
        Long id,
        String nome,
        String nomeSocial,
        String email,
        Boolean acessoFinanceiro,
        List<AlunoVinculadoDto> alunos) {

    public ResponsavelLogadoDto(Responsavel responsavel) {
        this(
                responsavel.getId(),
                responsavel.getDadosPessoais() == null ? null : responsavel.getDadosPessoais().getNome(),
                responsavel.getDadosPessoais() == null ? null : responsavel.getDadosPessoais().getNomeSocial(),
                responsavel.getDadosPessoais() == null ? null : responsavel.getDadosPessoais().getEmail(),
                Boolean.TRUE.equals(responsavel.getFinanceiro()),
                responsavel.getAlunos().stream().map(AlunoVinculadoDto::new).toList());
    }
}
