package br.com.brain.bolsa.dto;

import br.com.brain.bolsa.PoliticaBolsa;

public record PoliticaBolsaDto(
        Long id,
        Integer anoLetivo,
        Boolean exigeCebas,
        String observacao,
        /** Quantas regras ja penduradas: a tela usa para dizer se esta configurada. */
        Integer qtdMatrizes,
        Integer qtdAlcadas,
        Integer qtdEnvelopes) {

    public PoliticaBolsaDto(PoliticaBolsa p, int matrizes, int alcadas, int envelopes) {
        this(p.getId(), p.getAnoLetivo(), p.getExigeCebas(), p.getObservacao(),
                matrizes, alcadas, envelopes);
    }
}
