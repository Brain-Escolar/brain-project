package br.com.brain.bolsa.dto;

import br.com.brain.bolsa.AlcadaDesconto;
import br.com.brain.enums.PerfilNome;

import java.math.BigDecimal;

public record AlcadaDescontoDto(
        Long id,
        Long politicaId,
        PerfilNome perfil,
        BigDecimal percentualMax,
        Boolean podeExcederEnvelope) {

    public AlcadaDescontoDto(AlcadaDesconto a) {
        this(
                a.getId(),
                a.getPolitica().getId(),
                a.getPerfil().getNome(),
                a.getPercentualMax(),
                a.getPodeExcederEnvelope());
    }
}
