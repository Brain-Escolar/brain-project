package br.com.brain.dto.google;

import lombok.Data;

@Data
public class GoogleEventDto {
    private String id;
    private String summary;
    private String description;
    private EventoDateTimeDto start;
    private EventoDateTimeDto end;
}
