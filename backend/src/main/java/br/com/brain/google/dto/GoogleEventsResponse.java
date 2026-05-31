package br.com.brain.google.dto;

import java.util.List;

import lombok.Data;

@Data
public class GoogleEventsResponse {
    private String summary;
    private List<GoogleEventDto> items;
}
