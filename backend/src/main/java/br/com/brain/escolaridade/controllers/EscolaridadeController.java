package br.com.brain.escolaridade.controllers;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.brain.escolaridade.dtos.AtualizacaoEscolaridadeDto;
import br.com.brain.escolaridade.dtos.CadastroEscolaridadeDto;
import br.com.brain.escolaridade.dtos.ListagemEscolaridadeDto;
import br.com.brain.escolaridade.services.EscolaridadeService;
import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("escolaridade")
public class EscolaridadeController {

    private final EscolaridadeService service;

    @PostMapping
    public ResponseEntity<ListagemEscolaridadeDto> cadastrar(
            @RequestBody @Valid CadastroEscolaridadeDto dados, UriComponentsBuilder uriBuilder) {
        var escolaridade = service.cadastrarEscolaridade(dados);
        var uri = uriBuilder.path("/escolaridade/{id}").buildAndExpand(escolaridade.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemEscolaridadeDto(escolaridade));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemEscolaridadeDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemEscolaridadeDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoEscolaridadeDto dados) {
        var escolaridade = service.atualizar(id, dados);
        return ResponseEntity.ok(new ListagemEscolaridadeDto(escolaridade));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemEscolaridadeDto> detalhar(@PathVariable("id") Long id) {
        var escolaridade = service.detalhar(id);
        return ResponseEntity.ok(new ListagemEscolaridadeDto(escolaridade));
    }
}
