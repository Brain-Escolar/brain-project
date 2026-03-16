package br.com.brain.dto.alerta;

import java.time.LocalDate;

import br.com.brain.domain.alerta.Alerta;

public record ListagemAlertaDto(Long id, String titulo, String conteudo, LocalDate data) {

    public ListagemAlertaDto(Alerta alerta) {
        this(
                alerta.getId(),
                alerta.getTitulo(),
                alerta.getConteudo(),
                alerta.getData());
    }
}
