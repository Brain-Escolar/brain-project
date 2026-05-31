package br.com.brain.conversa;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.conversa.dto.CadastroConversaDto;
import br.com.brain.conversa.dto.ListagemConversaDto;
import br.com.brain.enums.PerfilNome;
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
@RequestMapping("conversas")
@RequiredArgsConstructor
public class ConversaController {

    private final ConversaService service;

    @PostMapping
    public ResponseEntity<ListagemConversaDto> abrir(
            @RequestBody @Valid CadastroConversaDto dados,
            @AuthenticationPrincipal DadosAutenticacao usuario,
            UriComponentsBuilder uriBuilder) {
        var conversa = service.abrir(dados, usuario.getDadosPessoais().getId());
        var uri = uriBuilder.path("/conversas/{id}").buildAndExpand(conversa.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemConversaDto(conversa, 0));
    }

    @GetMapping("/destinatario")
    public ResponseEntity<Page<ListagemConversaDto>> listarPorDestinatario(
            @RequestParam PerfilNome perfilNome,
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PageableDefault(size = 20, sort = "criadoEm") Pageable pageable) {
        return ResponseEntity
                .ok(service.listarPorDestinatario(usuario.getDadosPessoais().getId(), perfilNome, pageable));
    }

    @GetMapping("/remetente")
    public ResponseEntity<Page<ListagemConversaDto>> listarPorRemetente(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PageableDefault(size = 20, sort = "criadoEm") Pageable pageable) {
        return ResponseEntity.ok(service.listarPorRemetente(usuario.getDadosPessoais().getId(), pageable));
    }

    @GetMapping("/nao-lidas/contagem")
    public ResponseEntity<Long> contarNaoLidas(@AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.contarNaoLidas(usuario.getDadosPessoais().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemConversaDto> detalhar(
            @PathVariable Long id,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.detalhar(id, usuario.getDadosPessoais().getId()));
    }

    @PatchMapping("/{id}/fechar")
    public ResponseEntity<ListagemConversaDto> fechar(
            @PathVariable Long id,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var conversa = service.fechar(id);
        return ResponseEntity.ok(new ListagemConversaDto(conversa, 0));
    }
}
