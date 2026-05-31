package br.com.brain.alerta.dto;

import java.time.LocalDate;

import br.com.brain.alerta.models.Alerta;

public record ListagemAlertaDto(Long id, String titulo, String conteudo, LocalDate data) {

    public ListagemAlertaDto(Alerta alerta) {
        this(
                alerta.getId(),
                alerta.getTitulo(),
                alerta.getConteudo(),
                alerta.getData());
    }
}
