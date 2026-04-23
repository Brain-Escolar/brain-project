package br.com.brain.google.dtos;

import java.util.List;

import lombok.Data;

@Data
public class GoogleEventsResponse {
    private String summary;
    private List<GoogleEventDto> items;
}
