package br.com.brain.materialComplementar.dto;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.enums.TipoMaterial;
import br.com.brain.materialComplementar.MaterialComplementar;

import java.time.Instant;

public record ListagemMaterialComplementarDto(
        Long id,
        Long disciplinaId,
        String disciplinaNome,
        String titulo,
        String descricao,
        TipoMaterial tipo,
        String url,
        String dominio,
        ListagemArquivoDto arquivo,
        Instant criadoEm) {

    public ListagemMaterialComplementarDto(MaterialComplementar material, String dominio, String downloadUrl) {
        this(
                material.getId(),
                material.getDisciplina().getId(),
                material.getDisciplina().getNome(),
                material.getTitulo(),
                material.getDescricao(),
                material.getTipo(),
                material.getUrl(),
                dominio,
                material.getArquivo() != null ? new ListagemArquivoDto(material.getArquivo(), downloadUrl) : null,
                material.getCriadoEm());
    }
}
