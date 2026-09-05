package br.com.brain.crm.dto;

import br.com.brain.crm.ProcessoMatricula;
import br.com.brain.enums.StatusProcessoMatricula;
import br.com.brain.enums.TipoProcessoMatricula;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public record ListagemProcessoCrmDto(
        Long id,
        Long alunoId,
        String alunoNome,
        String serieNome,
        TipoProcessoMatricula tipo,
        StatusProcessoMatricula status,
        String origemNome,
        Long estagioId,
        String estagioNome,
        String subestagio,
        Long funcionarioId,
        String funcionarioNome,
        String responsavelNome,
        String responsavelTelefone,
        Instant criadoEm,
        long diasNoEstagio,
        Instant proximaAcao) {

    public ListagemProcessoCrmDto(ProcessoMatricula processo, Instant dataEntradaEstagioAtual, Instant proximaAcao) {
        this(
                processo.getId(),
                processo.getAluno().getId(),
                processo.getAluno().getDadosPessoais().getNome(),
                processo.getAluno().getSerie() == null ? "Sem série" : processo.getAluno().getSerie().getNome(),
                processo.getTipo(),
                processo.getStatus(),
                processo.getOrigem().getNome(),
                processo.getEstagioAtual().getId(),
                processo.getEstagioAtual().getNome(),
                processo.getSubestagio(),
                processo.getFuncionario() == null ? null : processo.getFuncionario().getId(),
                processo.getFuncionario() == null ? null : processo.getFuncionario().getNome(),
                processo.getResponsavelNome(),
                processo.getResponsavelTelefone(),
                processo.getCriadoEm(),
                dataEntradaEstagioAtual == null ? 0
                        : ChronoUnit.DAYS.between(dataEntradaEstagioAtual, Instant.now()),
                proximaAcao);
    }
}
