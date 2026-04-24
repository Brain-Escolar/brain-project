package br.com.brain.tarefa.controllers;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import br.com.brain.tarefa.dtos.AtualizacaoTarefaDto;
import br.com.brain.tarefa.dtos.CadastroTarefaDto;
import br.com.brain.tarefa.dtos.ListagemTarefaDto;
import br.com.brain.professor.services.ProfessorService;
import br.com.brain.tarefa.services.TarefaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("tarefa")
@RequiredArgsConstructor
public class TarefaController {

    private final TarefaService service;
    private final ProfessorService professorService;

    @PostMapping
    public ResponseEntity<ListagemTarefaDto> cadastrar(
            @RequestBody @Valid CadastroTarefaDto dados, UriComponentsBuilder uriBuilder,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var tarefa = service.cadastrarTarefa(dados, professor);
        var uri = uriBuilder.path("/tarefa/{id}").buildAndExpand(tarefa.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemTarefaDto(tarefa));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemTarefaDto>> listar(
            @PageableDefault(size = 10, sort = { "prazo" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemTarefaDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoTarefaDto dados) {
        var tarefa = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemTarefaDto(tarefa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemTarefaDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemTarefaDto> detalhar(@PathVariable("id") Long id) {
        var tarefa = service.detalhar(id);
        return ResponseEntity.ok(new ListagemTarefaDto(tarefa));
    }

    @GetMapping("/professor")
    public ResponseEntity<Page<ListagemTarefaDto>> recuperarTarefas(
            @PageableDefault(size = 10, sort = { "dataCriacao" }, direction = Direction.DESC) Pageable paginacao,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var page = service.recuperarTarefasProfessor(professor.getId(), paginacao);
        return ResponseEntity.ok(page);
    }
}
