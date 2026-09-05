package br.com.brain.crm.dto;

import br.com.brain.crm.Interacao;
import br.com.brain.enums.TipoInteracao;

import java.time.Instant;

public record ListagemInteracaoDto(
        Long id,
        TipoInteracao tipo,
        String resultado,
        String observacoes,
        String autorNome,
        Instant criadoEm,
        Instant proximaAcao) {

    public ListagemInteracaoDto(Interacao interacao) {
        this(
                interacao.getId(),
                interacao.getTipo(),
                interacao.getResultado(),
                interacao.getObservacoes(),
                interacao.getFuncionario() == null ? "Sistema" : interacao.getFuncionario().getNome(),
                interacao.getCriadoEm(),
                interacao.getProximaAcao());
    }
}
