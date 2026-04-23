package br.com.brain.avaliacao.controllers;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import br.com.brain.avaliacao.dtos.AtualizacaoAvaliacaoDto;
import br.com.brain.avaliacao.dtos.CadastroAvaliacaoDto;
import br.com.brain.avaliacao.dtos.CadastroNotasAvaliacaoDto;
import br.com.brain.aluno.dtos.NomeAlunoDto;
import br.com.brain.avaliacao.dtos.ListagemAvaliacaoDto;

import java.util.List;
import br.com.brain.avaliacao.services.AvaliacaoService;
import br.com.brain.professor.services.ProfessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.domain.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("avaliacao")
public class AvaliacaoController {

    private final AvaliacaoService service;
    private final ProfessorService professorService;

    @PostMapping
    public ResponseEntity<ListagemAvaliacaoDto> cadastrar(
            @RequestBody @Valid CadastroAvaliacaoDto dados, UriComponentsBuilder uriBuilder) {
        var avaliacao = service.cadastrarAvaliacao(dados);
        var uri = uriBuilder
                .path("/avaliacao/{id}")
                .buildAndExpand(avaliacao.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemAvaliacaoDto(avaliacao));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemAvaliacaoDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemAvaliacaoDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoAvaliacaoDto dados) {
        var avaliacao = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemAvaliacaoDto(avaliacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemAvaliacaoDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemAvaliacaoDto> detalhar(@PathVariable("id") Long id) {
        var avaliacao = service.detalhar(id);
        return ResponseEntity.ok(new ListagemAvaliacaoDto(avaliacao));
    }

    @GetMapping("/professor")
    public ResponseEntity<Page<ListagemAvaliacaoDto>> listarPorProfessor(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(service.listarPorProfessor(professor.getId(), paginacao));
    }

    @PostMapping("/{id}/notas")
    public ResponseEntity<Void> cadastrarNotasPorAvaliacao(
            @PathVariable Long id,
            @RequestBody @Valid CadastroNotasAvaliacaoDto dados) {
        service.cadastrarNotasDeUmaAvaliacao(id, dados);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/alunos")
    public ResponseEntity<List<NomeAlunoDto>> recuperarAlunosPorAvaliacao(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.recuperarAlunosPorAvaliacao(id));
    }
}
