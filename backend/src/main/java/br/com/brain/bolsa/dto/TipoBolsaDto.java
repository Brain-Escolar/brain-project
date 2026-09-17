package br.com.brain.bolsa.dto;

import br.com.brain.bolsa.TipoBolsa;

public record TipoBolsaDto(
        Long id,
        String codigo,
        String nome,
        Boolean estrutural,
        Boolean exigeComprovacao,
        Boolean contaParaCebas,
        Boolean acumulaComOutras) {

    public TipoBolsaDto(TipoBolsa tipo) {
        this(tipo.getId(), tipo.getCodigo(), tipo.getNome(), tipo.getEstrutural(),
                tipo.getExigeComprovacao(), tipo.getContaParaCebas(), tipo.getAcumulaComOutras());
    }
}
