package br.com.brain.simulacao.dto;

import br.com.brain.enums.Turno;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Monta a proposta a partir do catalogo vigente. Nada de valor vem daqui: preco
 * de tabela e do sistema, nao de quem preenche a tela.
 */
public record CriarSimulacaoRequest(

        /** Lead vindo do CRM. Um dos dois -- este ou alunoId -- e obrigatorio. */
        Long processoMatriculaId,

        /** Rematricula de aluno que ja existe. */
        Long alunoId,

        Long responsavelId,

        @NotNull(message = "O ano letivo é obrigatório.")
        Integer anoLetivo,

        @NotNull(message = "A unidade é obrigatória.")
        Long unidadeId,

        @NotNull(message = "A série é obrigatória.")
        Long serieId,

        Turno turno,

        @NotNull(message = "A quantidade de parcelas é obrigatória.")
        @Min(value = 1, message = "No mínimo 1 parcela.")
        @Max(value = 12, message = "No máximo 12 parcelas.")
        Integer qtdParcelas,

        @NotNull(message = "O dia de vencimento é obrigatório.")
        @Min(value = 1, message = "O vencimento vai do dia 1 ao 28.")
        @Max(value = 28, message = "O vencimento vai do dia 1 ao 28: fevereiro não tem dia 29 todo ano.")
        Integer diaVencimento) {
}
