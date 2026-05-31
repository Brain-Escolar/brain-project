package br.com.brain.alerta.dto;

import java.time.LocalDate;

import br.com.brain.alerta.models.Alerta;

public record DetalhamentoAlertaDto(Long id, String titulo, String conteudo, LocalDate data) {

    public DetalhamentoAlertaDto(Alerta alerta) {
        this(
                alerta.getId(),
                alerta.getTitulo(),
                alerta.getConteudo(),
                alerta.getData());
    }
}
