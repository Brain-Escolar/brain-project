package br.com.brain.comunicado.controllers;

import br.com.brain.comunicado.dto.AtualizacaoComunicadoDto;
import br.com.brain.comunicado.dto.CadastroComunicadoDto;
import br.com.brain.comunicado.dto.ListagemComunicadoDto;
import br.com.brain.comunicado.services.ComunicadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("comunicado")
@RequiredArgsConstructor
public class ComunicadoController {

    private final ComunicadoService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListagemComunicadoDto> cadastrar(
            @RequestPart("dados") @Valid CadastroComunicadoDto dados,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem,
            UriComponentsBuilder uriBuilder) {
        var comunicado = service.cadastrarComunicado(dados, imagem);
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
