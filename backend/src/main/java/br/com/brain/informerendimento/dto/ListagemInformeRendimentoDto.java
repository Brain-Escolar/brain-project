package br.com.brain.informerendimento.dto;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.informerendimento.InformeRendimento;

public record ListagemInformeRendimentoDto(
        Long id,
        Integer ano,
        Integer mesesConsiderados,
        Boolean completo,
        ListagemArquivoDto arquivo) {

    public ListagemInformeRendimentoDto(InformeRendimento informe, String downloadUrl) {
        this(
                informe.getId(),
                informe.getAno(),
                informe.getMesesConsiderados(),
                informe.getCompleto(),
                new ListagemArquivoDto(informe.getArquivo(), downloadUrl));
    }
}
