package br.com.brain.google.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import br.com.brain.google.dtos.EventoCalendarioDto;
import br.com.brain.google.dtos.EventosCalendarioDto;
import br.com.brain.google.services.CalendarGoogleService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/calendar/google")
@RequiredArgsConstructor
public class GoogleCalendarController {

    private final CalendarGoogleService service;

    @PostMapping("/eventos")
    public List<EventoCalendarioDto> criarEventos(@RequestBody EventosCalendarioDto eventos,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.createEvents("primary", eventos.eventos(), usuario);
        return eventos.eventos();
    }

    @PostMapping
    public String criarCalendario(String nomeCalendario, @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.createCalendar(nomeCalendario, usuario);
        return nomeCalendario;
    }

}
