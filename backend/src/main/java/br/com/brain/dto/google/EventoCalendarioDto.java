package br.com.brain.dto.google;

import lombok.Data;

@Data
public class EventoCalendarioDto {
    String titulo;
    String descricao;
    String dataInicio;
    String dataFim;
}
