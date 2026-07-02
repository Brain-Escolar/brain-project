package br.com.brain.holerite.dto;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.holerite.Holerite;

public record ListagemHoleriteDto(
        Long id,
        Integer ano,
        Integer mes,
        ListagemArquivoDto arquivo) {

    public ListagemHoleriteDto(Holerite holerite, String downloadUrl) {
        this(
                holerite.getId(),
                holerite.getAno(),
                holerite.getMes(),
                new ListagemArquivoDto(holerite.getArquivo(), downloadUrl));
    }
}
