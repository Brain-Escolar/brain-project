package br.com.brain.documento.dto;

import br.com.brain.enums.SituacaoDocumento;
import br.com.brain.enums.TipoDocumento;

/** Uma linha do checklist: o tipo exigido (ou opcional) e o que foi entregue para ele, se algo. */
public record ItemChecklistDocumentoDto(
        TipoDocumento tipo,
        String descricao,
        boolean obrigatorio,
        SituacaoDocumento situacao,
        DetalhamentoDocumentoDto documento) {
}
