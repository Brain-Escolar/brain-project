package br.com.brain.aluno.dto;

import java.util.List;

import br.com.brain.responsavel.Responsavel;
import br.com.brain.telefone.Telefone;

public record ResponsavelResumoDto(
        Long id,
        String nome,
        List<String> telefones,
        Boolean financeiro) {

    public ResponsavelResumoDto(Responsavel responsavel) {
        this(
                responsavel.getId(),
                responsavel.getDadosPessoais().getNome(),
                responsavel.getDadosPessoais().getTelefones().stream().map(Telefone::getNumero).toList(),
                responsavel.getFinanceiro());
    }
}
