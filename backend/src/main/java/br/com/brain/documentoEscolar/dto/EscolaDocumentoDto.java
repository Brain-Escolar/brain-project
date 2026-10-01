package br.com.brain.documentoEscolar.dto;

/** Cabeçalho institucional dos documentos escolares. */
public record EscolaDocumentoDto(
        String nome,
        String cnpj,
        String unidade) {
}
