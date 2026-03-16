package br.com.brain.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.brain.dto.turma.AtualizacaoTurmaDto;
import br.com.brain.dto.turma.CadastroTurmaDto;
import br.com.brain.dto.turma.ListagemTurmaDto;
import br.com.brain.service.TurmaService;
import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("turma")
public class TurmaController {

    private final TurmaService service;

    @PostMapping
    public ResponseEntity<ListagemTurmaDto> cadastrar(
            @RequestBody @Valid CadastroTurmaDto dados, UriComponentsBuilder uriBuilder) {
        var turma = service.cadastrarTurma(dados);
        var uri = uriBuilder.path("/turma/{id}").buildAndExpand(turma.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemTurmaDto(turma));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemTurmaDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemTurmaDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoTurmaDto dados) {
        var unidade = service.atualizar(id, dados);
        return ResponseEntity.ok(new ListagemTurmaDto(unidade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemTurmaDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemTurmaDto> detalhar(@PathVariable("id") Long id) {
        var turma = service.detalhar(id);
        return ResponseEntity.ok(new ListagemTurmaDto(turma));
    }
}
