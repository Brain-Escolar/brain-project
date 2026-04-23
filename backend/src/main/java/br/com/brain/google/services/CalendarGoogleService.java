package br.com.brain.google.services;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import br.com.brain.google.dtos.EventoCalendarioDto;
import br.com.brain.google.dtos.GoogleEventsResponse;

@Service
public class CalendarGoogleService {

    private final String GOOGLE_API_PATH = "https://www.googleapis.com/calendar/v3/calendars/";

    @Value("${google.calendar.api.key}")
    private String apiKey;

    private final RestClient restClient;

    public CalendarGoogleService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public void createEvents(String calendarId, List<EventoCalendarioDto> eventos,
            DadosAutenticacao usuario) {
        for (EventoCalendarioDto evento : eventos) {
            createEvent(calendarId, evento, usuario);
        }
    }

    public void createEvent(String calendarId, EventoCalendarioDto evento, DadosAutenticacao usuario) {
        var start = Map.of(
                "dateTime", evento.getDataInicio(),
                "timeZone", "America/Sao_Paulo");
        var end = Map.of(
                "dateTime", evento.getDataFim(),
                "timeZone", "America/Sao_Paulo");

        restClient.post()
                .uri(GOOGLE_API_PATH + calendarId + "/events" + "?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + usuario.getGoogleAccessToken())
                .body(Map.of(
                        "summary", evento.getTitulo(),
                        "description", evento.getDescricao(),
                        "start", start,
                        "end", end))
                .retrieve()
                .body(Void.class);
    }

    public void updateEvent() {
        // Logic to update an existing event in Google Calendar
    }

    public void deleteEvent() {
        // Logic to delete an event from Google Calendar
    }

    public List<EventoCalendarioDto> getNextEvents(String calendarId, String googleAccesToken) {
        String timeMin = java.time.OffsetDateTime.now().toString();
        String uri = GOOGLE_API_PATH + calendarId + "/events" + "?maxResults=10&orderBy=startTime&singleEvents=true"
                + "&timeMin=" + timeMin;
        var resposta = restClient.get()
                .uri(uri)
                .accept(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + googleAccesToken)
                .retrieve()
                .body(GoogleEventsResponse.class);

        var eventos = new ArrayList<EventoCalendarioDto>();
        for (var evento : resposta.getItems()) {
            var eventoDto = new EventoCalendarioDto();
            eventoDto.setTitulo(evento.getSummary());
            eventoDto.setDescricao(evento.getDescription());
            eventoDto.setDataInicio(evento.getStart().getDateTime());
            eventoDto.setDataFim(evento.getEnd().getDateTime());
            eventos.add(eventoDto);
        }
        return eventos;
    }

    public List<EventoCalendarioDto> getEventsFromDate(Long days, String calendarId, String googleAccesToken) {
        LocalDate targetDate = LocalDate.now().plusDays(days);
        String timeMin = targetDate.atStartOfDay(ZoneId.of("America/Sao_Paulo")).toOffsetDateTime().toString();
        String timeMax = targetDate.atTime(23, 59, 59).atZone(ZoneId.of("America/Sao_Paulo")).toOffsetDateTime()
                .toString();

        String uri = GOOGLE_API_PATH + calendarId + "/events" + "?maxResults=250&singleEvents=true"
                + "&timeMin=" + timeMin + "&timeMax=" + timeMax;

        var resposta = restClient.get()
                .uri(uri)
                .accept(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + googleAccesToken)
                .retrieve()
                .body(GoogleEventsResponse.class);

        var eventos = new ArrayList<EventoCalendarioDto>();
        for (var evento : resposta.getItems()) {
            var eventoDto = new EventoCalendarioDto();
            eventoDto.setTitulo(evento.getSummary());
            eventoDto.setDescricao(evento.getDescription());
            eventoDto.setDataInicio(evento.getStart().getDateTime());
            eventoDto.setDataFim(evento.getEnd().getDateTime());
            eventos.add(eventoDto);
        }
        return eventos;
    }

    public void listCalendars() {
        // Logic to list all calendars in Google Calendar
    }

    public void createCalendar(String nomeCalendario, DadosAutenticacao usuario) {

        restClient.post()
                .uri(GOOGLE_API_PATH + "?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + usuario.getGoogleAccessToken())
                .body(Map.of("summary", nomeCalendario))
                .retrieve()
                .body(Void.class);
    }

    public void deleteCalendar() {
        // Logic to delete a calendar from Google Calendar
    }
}
