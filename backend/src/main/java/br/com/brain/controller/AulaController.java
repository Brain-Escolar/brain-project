package br.com.brain.controller;

import br.com.brain.dto.DataDto;
import br.com.brain.dto.aluno.AlunosAulaDto;
import br.com.brain.dto.anotacao.AnotacaoAulaDto;
import br.com.brain.dto.aula.AtualizacaoAulaDto;
import br.com.brain.dto.aula.CadastroAulaDto;
import br.com.brain.dto.aula.ListagemAulaDto;
import br.com.brain.dto.aula.ProximaAulaDto;
import br.com.brain.dto.aula.AulaAtualDto;
import br.com.brain.service.AnotacaoService;
import br.com.brain.service.AulaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("aula")
public class AulaController {

    private final AulaService service;
    private final AnotacaoService anotacaoService;

    @PostMapping
    public ResponseEntity<ListagemAulaDto> cadastrar(
            @RequestBody @Valid CadastroAulaDto dados, UriComponentsBuilder uriBuilder) {
        var aula = service.cadastrarAula(dados);
        var uri = uriBuilder
                .path("/aula/{id}")
                .buildAndExpand(aula.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemAulaDto(aula));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemAulaDto>> listar(
            @PageableDefault(size = 10, sort = { "turma" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemAulaDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoAulaDto dados) {
        var aula = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemAulaDto(aula));
    }

    @GetMapping("{id}/alunos")
    public ResponseEntity<List<AlunosAulaDto>> recuperarAlunos(@PathVariable("id") Long aulaId) {
        var disciplina = service.recuperarDisciplina(aulaId);
        var alunos = service.recuperarAlunos(aulaId);
        var alunosDto = anotacaoService.recuperarAnotacoesPorDisciplina(disciplina.getId(), alunos);
        return ResponseEntity.ok(alunosDto);
    }

    @PostMapping("{id}/anotacoes")
    public ResponseEntity<List<AnotacaoAulaDto>> recuperarAnotacoes(@PathVariable("id") Long aulaId,
            @RequestBody DataDto data) {
        var alunosDto = anotacaoService.recuperarAnotacoesPorAula(aulaId, data.data());
        return ResponseEntity.ok(alunosDto);
    }

    @PostMapping("{id}/proxima-aula")
    public ResponseEntity<ProximaAulaDto> recuperarProximaAula(@PathVariable("id") Long aulaId,
            @RequestBody @Valid AulaAtualDto dados) {
        var proximaAula = service.recuperarProximaAula(aulaId, dados.data(), dados.horario());
        return ResponseEntity.ok(proximaAula);
    }
}
