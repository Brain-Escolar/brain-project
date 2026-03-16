package br.com.brain.controller;

import br.com.brain.domain.autenticacao.DadosAutenticacao;
import br.com.brain.dto.alerta.AtualizacaoAlertaDto;
import br.com.brain.dto.alerta.CadastroAlertaDto;
import br.com.brain.dto.alerta.ListagemAlertaDto;
import br.com.brain.service.AlertaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("alerta")
@RequiredArgsConstructor
public class AlertaController {

    private final AlertaService service;

    @PostMapping
    public ResponseEntity<ListagemAlertaDto> cadastrar(
            @RequestBody @Valid CadastroAlertaDto dados, UriComponentsBuilder uriBuilder) {
        var alerta = service.cadastrarAlerta(dados);
        var uri = uriBuilder.path("/alerta/{id}").buildAndExpand(alerta.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemAlertaDto(alerta));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemAlertaDto>> listar(
            @PageableDefault(size = 10, sort = { "titulo" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemAlertaDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoAlertaDto dados) {
        var alerta = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemAlertaDto(alerta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemAlertaDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemAlertaDto> detalhar(@PathVariable("id") Long id) {
        var alerta = service.detalhar(id);
        return ResponseEntity.ok(new ListagemAlertaDto(alerta));
    }

    @PatchMapping("/{id}/marcar-como-lido")
    public ResponseEntity<Void> marcarComoLido(@PathVariable("id") Long alertaId,
        @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.marcarComoLido(alertaId, usuario.getDadosPessoais().getId());
        return ResponseEntity.noContent().build();
    }
}
