package br.com.brain.google.dtos;

import lombok.Data;

@Data
public class EventoCalendarioDto {
    String titulo;
    String descricao;
    String dataInicio;
    String dataFim;
}
