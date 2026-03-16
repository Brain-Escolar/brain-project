package br.com.brain.controller;

import br.com.brain.domain.autenticacao.DadosAutenticacao;
import br.com.brain.dto.usuario.AlteracaoSenhaDto;
import br.com.brain.dto.usuario.ListagemUsuarioDto;
import br.com.brain.dto.usuario.RedefinicaoSenhaDto;
import br.com.brain.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("usuario")
public class UsuarioController {
    private final UsuarioService service;

    @GetMapping("/verificar-conta")
    public ResponseEntity<String> verificarEmail(@RequestParam String codigo) {
        service.verificarEmail(codigo);
        return ResponseEntity.ok("Conta verificada com sucesso!");
    }

    @GetMapping
    public ResponseEntity<Page<ListagemUsuarioDto>> listar(
            @PageableDefault(size = 10, sort = { "id" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemUsuarioDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemUsuarioDto> detalhar(@PathVariable("id") Long id) {
        var usuario = service.recuperarUsuarioPorId(id);
        return ResponseEntity.ok(new ListagemUsuarioDto(usuario));
    }

    @PostMapping("/alterar-senha")
    public ResponseEntity<ListagemUsuarioDto> alterarSenha(@RequestBody @Valid AlteracaoSenhaDto dados,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.alterarSenha(dados, usuario);
        return ResponseEntity.ok(new ListagemUsuarioDto(usuario));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<ListagemUsuarioDto> redefinirSenha(@RequestBody @Valid RedefinicaoSenhaDto dados,
            String token) {
        var usuario = service.redefinirSenha(dados, token);
        return ResponseEntity.ok(new ListagemUsuarioDto(usuario));
    }
}
