package br.com.brain.turma;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.brain.aluno.dto.ListagemAlunoDto;
import br.com.brain.turma.dto.AtualizacaoTurmaDto;
import br.com.brain.turma.dto.CadastroTurmaDto;
import br.com.brain.turma.dto.ListagemTurmaDto;
import br.com.brain.turma.dto.VincularAlunosDto;

import java.util.List;
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
        return ResponseEntity.created(uri).body(service.toListagemDto(turma));
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
        return ResponseEntity.ok(service.toListagemDto(unidade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemTurmaDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemTurmaDto> detalhar(@PathVariable("id") Long id) {
        var turma = service.detalhar(id);
        return ResponseEntity.ok(service.toListagemDto(turma));
    }

    @GetMapping("/{id}/alunos")
    public ResponseEntity<List<ListagemAlunoDto>> listarAlunos(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarAlunos(id));
    }

    @PostMapping("/{id}/alunos")
    public ResponseEntity<Void> vincularAlunos(@PathVariable Long id,
            @RequestBody @Valid VincularAlunosDto dados) {
        service.vincularAlunos(id, dados.alunoIds());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/alunos/{alunoId}")
    public ResponseEntity<Void> desvincularAluno(@PathVariable Long id, @PathVariable Long alunoId) {
        service.desvincularAluno(id, alunoId);
        return ResponseEntity.noContent().build();
    }
}
