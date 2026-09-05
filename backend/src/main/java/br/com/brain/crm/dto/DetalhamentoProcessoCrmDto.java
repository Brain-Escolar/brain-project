package br.com.brain.crm.dto;

import br.com.brain.crm.ProcessoMatricula;
import br.com.brain.enums.StatusProcessoMatricula;
import br.com.brain.enums.TipoProcessoMatricula;

import java.time.Instant;
import java.util.List;

public record DetalhamentoProcessoCrmDto(
        Long id,
        Long alunoId,
        String alunoNome,
        String alunoEmail,
        String serieNome,
        TipoProcessoMatricula tipo,
        StatusProcessoMatricula status,
        String origemNome,
        Long estagioAtualId,
        String estagioAtualNome,
        String subestagio,
        Integer anoLetivo,
        Long funcionarioId,
        String funcionarioNome,
        Instant funcionarioDesde,
        String responsavelNome,
        String responsavelTelefone,
        String motivoPerda,
        Instant criadoEm,
        Instant dataConclusao,
        List<StepFunilDto> steps,
        List<ListagemInteracaoDto> interacoes,
        Instant proximaAcao) {

    public DetalhamentoProcessoCrmDto(ProcessoMatricula processo, List<StepFunilDto> steps,
            List<ListagemInteracaoDto> interacoes, Instant funcionarioDesde) {
        this(
                processo.getId(),
                processo.getAluno().getId(),
                processo.getAluno().getDadosPessoais().getNome(),
                processo.getAluno().getDadosPessoais().getEmail(),
                processo.getAluno().getSerie() == null ? "Sem série" : processo.getAluno().getSerie().getNome(),
                processo.getTipo(),
                processo.getStatus(),
                processo.getOrigem().getNome(),
                processo.getEstagioAtual().getId(),
                processo.getEstagioAtual().getNome(),
                processo.getSubestagio(),
                processo.getAnoLetivo(),
                processo.getFuncionario() == null ? null : processo.getFuncionario().getId(),
                processo.getFuncionario() == null ? null : processo.getFuncionario().getNome(),
                funcionarioDesde,
                processo.getResponsavelNome(),
                processo.getResponsavelTelefone(),
                processo.getMotivoPerda(),
                processo.getCriadoEm(),
                processo.getDataConclusao(),
                steps,
                interacoes,
                interacoes.stream()
                        .map(ListagemInteracaoDto::proximaAcao)
                        .filter(p -> p != null)
                        .findFirst()
                        .orElse(null));
    }
}
