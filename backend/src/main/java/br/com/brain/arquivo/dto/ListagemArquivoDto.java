package br.com.brain.arquivo.dto;

import br.com.brain.arquivo.Arquivo;

public record ListagemArquivoDto(
        Long id,
        String nome,
        String contentType,
        Long tamanho,
        String downloadUrl) {

    public ListagemArquivoDto(Arquivo arquivo, String downloadUrl) {
        this(
                arquivo.getId(),
                arquivo.getNomeOriginal(),
                arquivo.getContentType(),
                arquivo.getTamanho(),
                downloadUrl);
    }
}
