package br.com.brain.conteudo.controllers;

import br.com.brain.conteudo.dtos.AtualizacaoConteudoDto;
import br.com.brain.conteudo.dtos.CadastroConteudoDto;
import br.com.brain.conteudo.dtos.ListagemConteudoDto;
import br.com.brain.conteudo.services.ConteudoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("conteudo")
@RequiredArgsConstructor
public class ConteudoController {

    private final ConteudoService service;

    @PostMapping
    public ResponseEntity<ListagemConteudoDto> cadastrar(
            @RequestBody @Valid CadastroConteudoDto dados, UriComponentsBuilder uriBuilder) {
        var conteudo = service.cadastrarConteudo(dados);
        var uri = uriBuilder.path("/conteudo/{id}").buildAndExpand(conteudo.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemConteudoDto(conteudo));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemConteudoDto>> listar(
            @PageableDefault(size = 10, sort = { "data" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemConteudoDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoConteudoDto dados) {
        var conteudo = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemConteudoDto(conteudo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemConteudoDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemConteudoDto> detalhar(@PathVariable("id") Long id) {
        var conteudo = service.detalhar(id);
        return ResponseEntity.ok(new ListagemConteudoDto(conteudo));
    }
}
