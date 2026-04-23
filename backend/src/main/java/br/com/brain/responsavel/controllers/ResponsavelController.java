package br.com.brain.responsavel.controllers;

import br.com.brain.responsavel.dtos.AtualizacaoResponsavelDto;
import br.com.brain.responsavel.dtos.CadastroResponsavelDto;
import br.com.brain.responsavel.dtos.DetalhamentoResponsavelDto;
import br.com.brain.responsavel.dtos.ListagemResponsavelDto;
import br.com.brain.responsavel.services.ResponsavelService;
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
@RequestMapping("responsavel")
public class ResponsavelController {

    private final ResponsavelService service;

    @PostMapping
    public ResponseEntity<DetalhamentoResponsavelDto> cadastrar(
            @RequestBody @Valid CadastroResponsavelDto dados,
            @PathVariable("alunoId") Long alunoId,
            UriComponentsBuilder uriBuilder) {
        var responsavel = service.cadastrarResponsavel(dados, alunoId);
        var uri = uriBuilder.path("/responsavel/{id}").buildAndExpand(responsavel.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoResponsavelDto(responsavel));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemResponsavelDto>> listar(
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoResponsavelDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoResponsavelDto dados) {
        var responsavel = service.atualizar(dados, id);
        return ResponseEntity.ok(new DetalhamentoResponsavelDto(responsavel));
    }

    @PutMapping("{responsavelId}/vincular-alunos")
    public ResponseEntity<DetalhamentoResponsavelDto> vincularAlunos(
            @PathVariable("responsavelId") Long responsavelId,
            @RequestBody List<Long> alunoIds) {
        var responsavel = service.vincularAlunos(responsavelId, alunoIds);
        return ResponseEntity.ok(new DetalhamentoResponsavelDto(responsavel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DetalhamentoResponsavelDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoResponsavelDto> detalhar(@PathVariable("id") Long id) {
        var responsavel = service.detalhar(id);
        return ResponseEntity.ok(new DetalhamentoResponsavelDto(responsavel));
    }
}
