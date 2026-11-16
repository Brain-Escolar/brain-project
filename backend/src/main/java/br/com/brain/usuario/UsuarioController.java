package br.com.brain.usuario;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.usuario.dto.AlteracaoSenhaDto;
import br.com.brain.usuario.dto.ListagemUsuarioDto;
import br.com.brain.infra.multitenancy.TenantContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
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
    public ResponseEntity<String> verificarEmail(@RequestParam String codigo, @RequestParam String schema) {
        TenantContext.setTenantId(schema);
        service.verificarEmail(codigo);
        return ResponseEntity.ok("Conta verificada com sucesso!");
    }

    @PostMapping("/alterar-senha")
    public ResponseEntity<ListagemUsuarioDto> alterarSenha(@RequestBody @Valid AlteracaoSenhaDto dados,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.alterarSenha(dados, usuario);
        return ResponseEntity.ok(new ListagemUsuarioDto(usuario));
    }
}
