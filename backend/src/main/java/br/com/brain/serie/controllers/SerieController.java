package br.com.brain.serie.controllers;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.brain.serie.dtos.AtualizacaoSerieDto;
import br.com.brain.serie.dtos.CadastroSerieDto;
import br.com.brain.serie.dtos.ListagemSerieDto;
import br.com.brain.serie.services.SerieService;
import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("serie")
public class SerieController {

    private final SerieService service;

    @PostMapping
    public ResponseEntity<ListagemSerieDto> cadastrar(
            @RequestBody @Valid CadastroSerieDto dados, UriComponentsBuilder uriBuilder) {
        var serie = service.cadastrarSerie(dados);
        var uri = uriBuilder.path("/serie/{id}").buildAndExpand(serie.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemSerieDto(serie));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemSerieDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemSerieDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoSerieDto dados) {
        var serie = service.atualizar(id, dados);
        return ResponseEntity.ok(new ListagemSerieDto(serie));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemSerieDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemSerieDto> detalhar(@PathVariable("id") Long id) {
        var serie = service.detalhar(id);
        return ResponseEntity.ok(new ListagemSerieDto(serie));
    }
}
