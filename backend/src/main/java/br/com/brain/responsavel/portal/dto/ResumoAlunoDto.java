package br.com.brain.responsavel.portal.dto;

import br.com.brain.anotacao.dto.ListagemAnotacaoSemanaDto;
import br.com.brain.relatorios.dto.RelatorioDto;
import br.com.brain.tarefa.dto.ListagemTarefaAlunoDto;

import java.util.List;

/**
 * Payload unico da Home do responsavel.
 *
 * Existe para evitar a cascata de requests que aconteceria a cada troca de
 * aluno no seletor: uma chamada, uma invalidacao de cache, uma re-renderizacao.
 */
public record ResumoAlunoDto(
        AlunoVinculadoDto aluno,
        RelatorioDto relatorio,
        List<ListagemTarefaAlunoDto> proximasTarefas,
        List<ListagemAnotacaoSemanaDto> ocorrenciasDaSemana) {
}
