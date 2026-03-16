package br.com.brain.dto.google;

import java.util.List;

import lombok.Data;

@Data
public class GoogleEventsResponse {
    private String summary;
    private List<GoogleEventDto> items;
}
