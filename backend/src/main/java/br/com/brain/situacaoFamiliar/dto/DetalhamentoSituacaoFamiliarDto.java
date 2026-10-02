package br.com.brain.situacaoFamiliar.dto;

import java.util.List;

/**
 * Situação familiar de um aluno. `opcoesDisponiveis` acompanha o catálogo ativo
 * para a tela montar os checkboxes sem uma segunda chamada.
 */
public record DetalhamentoSituacaoFamiliarDto(
        Long id,
        String descricao,
        List<Long> opcoesMarcadas,
        List<SituacaoFamiliarOpcaoDto> opcoesDisponiveis) {
}
