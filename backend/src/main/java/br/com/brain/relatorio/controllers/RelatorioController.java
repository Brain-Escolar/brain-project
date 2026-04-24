package br.com.brain.relatorio.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import br.com.brain.relatorio.dtos.FiltroRelatorioDto;
import br.com.brain.relatorio.services.RelatorioService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("relatorio")
@RequiredArgsConstructor
public class RelatorioController {

    private final RelatorioService service;

    @GetMapping("/anos")
    public List<Integer> recuperaFiltroDeAnos(@AuthenticationPrincipal DadosAutenticacao usuario) {
        return service.recuperarAnosDeAtividadePorUsuario(usuario);
    }

    @GetMapping("/anos/{ano}")
    public List<FiltroRelatorioDto> recuperaTodosOsFiltros(@AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable Integer ano) {
        return service.recuperarFiltrosProfessor(usuario, ano);
    }

}
