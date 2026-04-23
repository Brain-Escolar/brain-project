package br.com.brain.disciplina.controllers;

import br.com.brain.disciplina.dtos.AtualizacaoDisciplinaDto;
import br.com.brain.disciplina.dtos.CadastroDisciplinaDto;
import br.com.brain.disciplina.dtos.DetalhamentoDisciplinaDto;
import br.com.brain.disciplina.dtos.ListagemDisciplinaDto;
import br.com.brain.disciplina.services.DisciplinaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("disciplina")
public class DisciplinaController {

    private final DisciplinaService service;

    @PostMapping
    public ResponseEntity<DetalhamentoDisciplinaDto> cadastrar(
            @RequestBody @Valid CadastroDisciplinaDto dados, UriComponentsBuilder uriBuilder) {
        var disciplina = service.cadastrarDisciplina(dados);
        var uri = uriBuilder.path("/disciplina/{id}").buildAndExpand(disciplina.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoDisciplinaDto(disciplina));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemDisciplinaDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoDisciplinaDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoDisciplinaDto dados) {
        var disciplina = service.atualizar(dados, id);
        return ResponseEntity.ok(new DetalhamentoDisciplinaDto(disciplina));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DetalhamentoDisciplinaDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoDisciplinaDto> detalhar(@PathVariable("id") Long id) {
        var disciplina = service.detalhar(id);
        return ResponseEntity.ok(new DetalhamentoDisciplinaDto(disciplina));
    }
}
