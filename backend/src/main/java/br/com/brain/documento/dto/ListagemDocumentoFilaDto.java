package br.com.brain.documento.dto;

import br.com.brain.documento.Documento;
import br.com.brain.enums.StatusDocumento;
import br.com.brain.enums.TipoDocumento;

import java.time.Instant;

public record ListagemDocumentoFilaDto(
        Long id,
        TipoDocumento tipo,
        String tipoDescricao,
        StatusDocumento status,
        Instant enviadoEm,
        Long dadosPessoaisId,
        String nomePessoa) {

    public ListagemDocumentoFilaDto(Documento documento) {
        this(
                documento.getId(),
                documento.getTipo(),
                documento.getTipo().getDescricao(),
                documento.getStatus(),
                documento.getEnviadoEm(),
                documento.getDadosPessoais().getId(),
                documento.getDadosPessoais().getNome());
    }
}
