package br.com.brain.controller;

import br.com.brain.dto.comunicado.AtualizacaoComunicadoDto;
import br.com.brain.dto.comunicado.CadastroComunicadoDto;
import br.com.brain.dto.comunicado.ListagemComunicadoDto;
import br.com.brain.service.ComunicadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("comunicado")
@RequiredArgsConstructor
public class ComunicadoController {

    private final ComunicadoService service;

    @PostMapping
    public ResponseEntity<ListagemComunicadoDto> cadastrar(
            @RequestBody @Valid CadastroComunicadoDto dados, UriComponentsBuilder uriBuilder) {
        var comunicado = service.cadastrarComunicado(dados);
        var uri = uriBuilder.path("/comunicado/{id}").buildAndExpand(comunicado.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemComunicadoDto(comunicado));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemComunicadoDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemComunicadoDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoComunicadoDto dados) {
        var comunicado = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemComunicadoDto(comunicado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemComunicadoDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemComunicadoDto> detalhar(@PathVariable("id") Long id) {
        var comunicado = service.detalhar(id);
        return ResponseEntity.ok(new ListagemComunicadoDto(comunicado));
    }
}
