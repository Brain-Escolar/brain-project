package br.com.brain.google.dto;

import lombok.Data;

@Data
public class EventoCalendarioDto {
    String titulo;
    String descricao;
    String dataInicio;
    String dataFim;
}
