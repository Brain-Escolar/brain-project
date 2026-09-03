package br.com.brain.orientacao.dto;

/**
 * Números de acompanhamento exibidos no topo da tela inicial da Orientação.
 * Todos são contagens do tenant logado — a Orientação enxerga a escola inteira.
 */
public record IndicadoresOrientacaoDto(
        long alunosMatriculados,
        long alunosSemTurma,
        long turmas,
        long atendimentosAbertos,
        long atendimentosNaoLidos,
        long comunicadosRecentes) {
}
