package br.com.brain.atendimentoPsicologico.dto;

import java.time.LocalDate;

import br.com.brain.atendimentoPsicologico.AtendimentoPsicologico;
import br.com.brain.fichamedica.dto.LaudoMedicoDto;

public record ListagemAtendimentoPsicologicoDto(
        Long id,
        LocalDate data,
        String profissional,
        String descricao,
        LaudoMedicoDto laudo) {

    public ListagemAtendimentoPsicologicoDto(AtendimentoPsicologico atendimento, String urlLaudo) {
        this(
                atendimento.getId(),
                atendimento.getData(),
                atendimento.getProfissional(),
                atendimento.getDescricao(),
                atendimento.getLaudo() != null ? new LaudoMedicoDto(atendimento.getLaudo(), urlLaudo) : null);
    }
}
