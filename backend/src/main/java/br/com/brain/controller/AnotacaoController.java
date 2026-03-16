package br.com.brain.controller;

import br.com.brain.dto.anotacao.AtualizacaoAnotacaoDto;
import br.com.brain.dto.anotacao.CadastroAnotacaoDto;
import br.com.brain.dto.anotacao.ListagemAnotacaoDto;
import br.com.brain.service.AnotacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("anotacao")
public class AnotacaoController {
    private final AnotacaoService service;

    @PostMapping
    public ResponseEntity<ListagemAnotacaoDto> cadastrar(
            @RequestBody @Valid CadastroAnotacaoDto dados, UriComponentsBuilder uriBuilder) {
        var anotacao = service.cadastrarAnotacao(dados);
        var uri = uriBuilder.path("/anotacao/{id}").buildAndExpand(anotacao.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemAnotacaoDto(anotacao));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemAnotacaoDto>> listar(
            @PageableDefault(size = 10, sort = { "dataAnotacao" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemAnotacaoDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoAnotacaoDto dados) {
        var anotacao = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemAnotacaoDto(anotacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemAnotacaoDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
