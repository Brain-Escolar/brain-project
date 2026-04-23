package br.com.brain.fichamedica.controllers;

import br.com.brain.shared.arquivo.ListagemArquivoDto;
import br.com.brain.fichamedica.dtos.AtualizacaoFichaMedicaDto;
import br.com.brain.fichamedica.dtos.CadastroFichaMedicaDto;
import br.com.brain.fichamedica.dtos.ListagemFichaMedicaDto;
import br.com.brain.fichamedica.services.FichaMedicaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("ficha-medica")
public class FichaMedicaController {

    private final FichaMedicaService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListagemFichaMedicaDto> cadastrar(
            @RequestPart("dados") @Valid CadastroFichaMedicaDto dados,
            @RequestPart("laudos") List<MultipartFile> laudos,
            UriComponentsBuilder uriBuilder) {

        var fichaMedica = service.cadastrarFichaMedica(laudos, dados);
        var uri = uriBuilder.path("/ficha-medica/{id}").buildAndExpand(fichaMedica.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemFichaMedicaDto(fichaMedica));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemFichaMedicaDto>> listar(
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemFichaMedicaDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoFichaMedicaDto dados) {
        var fichaMedica = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemFichaMedicaDto(fichaMedica));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemFichaMedicaDto> detalhar(@PathVariable("id") Long id) {
        var fichaMedica = service.detalhar(id);
        return ResponseEntity.ok(new ListagemFichaMedicaDto(fichaMedica));
    }

    @GetMapping("/{id}/laudos")
    public ResponseEntity<Page<ListagemArquivoDto>> listarLaudos(
            @PageableDefault(size = 10, sort = { "arquivo.nomeOriginal" }) Pageable paginacao) {
        var page = service.listarLaudos(paginacao);
        return ResponseEntity.ok(page);
    }
}
