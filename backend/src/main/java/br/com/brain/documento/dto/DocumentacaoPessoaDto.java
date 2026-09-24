package br.com.brain.documento.dto;

import java.util.List;

public record DocumentacaoPessoaDto(
        Long dadosPessoaisId,
        String nome,
        PapelDocumentacao papel,
        boolean responsavelFinanceiro,
        String fotoUrl,
        boolean completa,
        List<ItemChecklistDocumentoDto> itens) {

    public enum PapelDocumentacao {
        ALUNO,
        RESPONSAVEL
    }
}
