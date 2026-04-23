package br.com.brain.shared.arquivo;

import br.com.brain.shared.arquivo.Arquivo;

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
