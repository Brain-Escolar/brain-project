package br.com.brain.controller;

import br.com.brain.domain.autenticacao.DadosAutenticacao;
import br.com.brain.dto.mensagem.CadastroMensagemDto;
import br.com.brain.dto.mensagem.ListagemMensagemDto;
import br.com.brain.service.MensagemService;
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
@RequestMapping("conversas/{conversaId}/mensagens")
@RequiredArgsConstructor
public class MensagemController {

    private final MensagemService service;

    @PostMapping
    public ResponseEntity<ListagemMensagemDto> enviar(
            @PathVariable Long conversaId,
            @RequestBody @Valid CadastroMensagemDto dados,
            @AuthenticationPrincipal DadosAutenticacao usuario,
            UriComponentsBuilder uriBuilder) {
        var mensagem = service.enviar(conversaId, dados, usuario.getDadosPessoais().getId());
        var uri = uriBuilder.path("/conversas/{conversaId}/mensagens/{id}")
                .buildAndExpand(conversaId, mensagem.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemMensagemDto(mensagem));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemMensagemDto>> listar(
            @PathVariable Long conversaId,
            @PageableDefault(size = 50, sort = "criadoEm") Pageable pageable) {
        return ResponseEntity.ok(service.listar(conversaId, pageable));
    }

    @PostMapping("/lidas")
    public ResponseEntity<Void> marcarTodasComoLida(
            @PathVariable Long conversaId,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.marcarTodasComoLida(conversaId, usuario.getDadosPessoais().getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{mensagemId}/lida")
    public ResponseEntity<Void> marcarComoLida(
            @PathVariable Long conversaId,
            @PathVariable Long mensagemId,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.marcarComoLida(mensagemId, usuario.getDadosPessoais().getId());
        return ResponseEntity.noContent().build();
    }
}
