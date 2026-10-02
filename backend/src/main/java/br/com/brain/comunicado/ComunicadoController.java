package br.com.brain.comunicado;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.comunicado.dto.AtualizacaoComunicadoDto;
import br.com.brain.comunicado.dto.CadastroComunicadoDto;
import br.com.brain.comunicado.dto.ListagemComunicadoDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
            @RequestPart(value = "anexo", required = false) MultipartFile anexo,
            UriComponentsBuilder uriBuilder) {
        var comunicado = service.cadastrarComunicado(dados, imagem, anexo);
        var uri = uriBuilder.path("/comunicado/{id}").buildAndExpand(comunicado.id()).toUri();
        return ResponseEntity.created(uri).body(comunicado);
    }

    @GetMapping
    public ResponseEntity<Page<ListagemComunicadoDto>> listar(
            @PageableDefault(size = 10, sort = { "data" }) Pageable paginacao,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var page = service.listar(paginacao, usuario);
        return ResponseEntity.ok(page);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListagemComunicadoDto> atualizar(@PathVariable("id") Long id,
            @RequestPart("dados") @Valid AtualizacaoComunicadoDto dados,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem,
            @RequestPart(value = "anexo", required = false) MultipartFile anexo,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.atualizar(dados, id, usuario, imagem, anexo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.excluir(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemComunicadoDto> detalhar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }
}
