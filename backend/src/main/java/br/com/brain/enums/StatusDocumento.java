package br.com.brain.enums;

/**
 * Situacao de um documento ENVIADO. "Pendente" nao existe aqui: e a ausencia
 * do documento para um tipo exigido (ver SituacaoDocumento).
 */
public enum StatusDocumento {
    EM_ANALISE,
    APROVADO,
    REJEITADO
}
