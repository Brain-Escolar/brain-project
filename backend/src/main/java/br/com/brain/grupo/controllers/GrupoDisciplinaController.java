package br.com.brain.grupo.controllers;

import br.com.brain.grupo.dtos.AtualizacaoGrupoDisciplinaDto;
import br.com.brain.grupo.dtos.CadastroGrupoDisciplinaDto;
import br.com.brain.grupo.dtos.DetalhamentoGrupoDisciplinaDto;
import br.com.brain.grupo.dtos.ListagemGrupoDisciplinaDto;
import br.com.brain.grupo.services.GrupoDisciplinaService;
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
@RequestMapping("grupo-disciplina")
public class GrupoDisciplinaController {

    private final GrupoDisciplinaService service;

    @PostMapping
    public ResponseEntity<DetalhamentoGrupoDisciplinaDto> cadastrar(
            @RequestBody @Valid CadastroGrupoDisciplinaDto dados, UriComponentsBuilder uriBuilder) {
        var grupoDisciplina = service.cadastrarGrupoDisciplina(dados);
        var uri = uriBuilder.path("/grupo-disciplina/{id}").buildAndExpand(grupoDisciplina.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoGrupoDisciplinaDto(grupoDisciplina));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemGrupoDisciplinaDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoGrupoDisciplinaDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoGrupoDisciplinaDto dados) {
        var grupoDisciplina = service.atualizar(dados, id);
        return ResponseEntity.ok(new DetalhamentoGrupoDisciplinaDto(grupoDisciplina));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DetalhamentoGrupoDisciplinaDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoGrupoDisciplinaDto> detalhar(@PathVariable("id") Long id) {
        var grupoDisciplina = service.detalhar(id);
        return ResponseEntity.ok(new DetalhamentoGrupoDisciplinaDto(grupoDisciplina));
    }
}
