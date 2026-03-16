package br.com.brain.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.brain.dto.unidade.AtualizacaoUnidadeDto;
import br.com.brain.dto.unidade.CadastroUnidadeDto;
import br.com.brain.dto.unidade.ListagemUnidadeDto;
import br.com.brain.service.UnidadeService;
import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("unidade")
public class UnidadeController {

    private final UnidadeService service;

    @PostMapping
    public ResponseEntity<ListagemUnidadeDto> cadastrar(
            @RequestBody @Valid CadastroUnidadeDto dados, UriComponentsBuilder uriBuilder) {
        var unidade = service.cadastrarUnidade(dados);
        var uri = uriBuilder.path("/unidade/{id}").buildAndExpand(unidade.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemUnidadeDto(unidade));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemUnidadeDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemUnidadeDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoUnidadeDto dados) {
        var unidade = service.atualizar(id, dados);
        return ResponseEntity.ok(new ListagemUnidadeDto(unidade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemUnidadeDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemUnidadeDto> detalhar(@PathVariable("id") Long id) {
        var unidade = service.detalhar(id);
        return ResponseEntity.ok(new ListagemUnidadeDto(unidade));
    }
}
