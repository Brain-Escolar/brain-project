package br.com.brain.google.dto;

import lombok.Data;

@Data
public class GoogleEventDto {
    private String id;
    private String summary;
    private String description;
    private EventoDateTimeDto start;
    private EventoDateTimeDto end;
}
