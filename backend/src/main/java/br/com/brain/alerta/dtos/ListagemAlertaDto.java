package br.com.brain.alerta.dtos;

import java.time.LocalDate;

import br.com.brain.alerta.domain.Alerta;

public record ListagemAlertaDto(Long id, String titulo, String conteudo, LocalDate data) {

    public ListagemAlertaDto(Alerta alerta) {
        this(
                alerta.getId(),
                alerta.getTitulo(),
                alerta.getConteudo(),
                alerta.getData());
    }
}
