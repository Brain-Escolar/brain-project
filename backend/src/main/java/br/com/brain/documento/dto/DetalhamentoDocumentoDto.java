package br.com.brain.documento.dto;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.enums.StatusDocumento;
import br.com.brain.enums.TipoDocumento;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record DetalhamentoDocumentoDto(
        Long id,
        TipoDocumento tipo,
        String tipoDescricao,
        StatusDocumento status,
        String motivoRejeicao,
        LocalDate dataValidade,
        Instant enviadoEm,
        String validadoPor,
        Instant validadoEm,
        List<ListagemArquivoDto> arquivos) {
}
