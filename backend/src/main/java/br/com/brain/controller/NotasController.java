package br.com.brain.controller;

import br.com.brain.dto.notas.AtualizacaoNotasDto;
import br.com.brain.dto.notas.CadastroNotasDto;
import br.com.brain.dto.notas.DetalhamentoNotasAlunoDisciplinaDto;
import br.com.brain.dto.notas.ListagemNotasDto;
import br.com.brain.service.NotasService;
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
@RequestMapping("notas")
public class NotasController {

    private final NotasService service;

    @PostMapping
    public ResponseEntity<ListagemNotasDto> cadastrar(
            @RequestBody @Valid CadastroNotasDto dados, UriComponentsBuilder uriBuilder) {
        var notas = service.cadastrarNotas(dados);
        var uri = uriBuilder.path("/notas/{id}").buildAndExpand(notas.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemNotasDto(notas));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemNotasDto>> listar(
            @PageableDefault(size = 10, sort = { "aluno" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemNotasDto> atualizar(
            @RequestBody @Valid AtualizacaoNotasDto dados, @PathVariable("id") Long id) {
        var notas = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemNotasDto(notas));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemNotasDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemNotasDto> detalhar(@PathVariable("id") Long id) {
        var notas = service.detalhar(id);
        return ResponseEntity.ok(new ListagemNotasDto(notas));
    }

    @GetMapping("/aluno/{alunoId}/disciplina/{disciplinaId}")
    public ResponseEntity<DetalhamentoNotasAlunoDisciplinaDto> buscarNotasAlunoPorDisciplina(
            @PathVariable Long alunoId,
            @PathVariable Long disciplinaId) {
        var resultado = service.buscarNotasAlunoPorDisciplina(alunoId, disciplinaId);
        return ResponseEntity.ok(resultado);
    }
}
