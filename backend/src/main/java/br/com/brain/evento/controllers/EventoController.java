package br.com.brain.evento.controllers;

import br.com.brain.evento.dtos.AtualizacaoEventoDto;
import br.com.brain.evento.dtos.CadastroEventoDto;
import br.com.brain.evento.dtos.DetalhamentoEventoDto;
import br.com.brain.evento.dtos.ListagemEventoDto;
import br.com.brain.evento.services.EventoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("evento")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService service;

    @PostMapping
    public ResponseEntity<DetalhamentoEventoDto> cadastrar(
            @RequestBody @Valid CadastroEventoDto dados, UriComponentsBuilder uriBuilder) {
        var evento = service.cadastrar(dados);
        var uri = uriBuilder.path("/evento/{id}").buildAndExpand(evento.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoEventoDto(evento));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemEventoDto>> listar(
            @RequestParam(required = false) Long turmaId,
            @RequestParam(required = false) Long serieId,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) Long professorId,
            @PageableDefault(size = 10, sort = {"dataEvento"}) Pageable pageable) {
        var page = service.listar(turmaId, serieId, unidadeId, professorId, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoEventoDto> detalhar(@PathVariable Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoEventoDto> atualizar(
            @PathVariable Long id, @RequestBody @Valid AtualizacaoEventoDto dados) {
        var evento = service.atualizar(dados, id);
        return ResponseEntity.ok(new DetalhamentoEventoDto(evento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
