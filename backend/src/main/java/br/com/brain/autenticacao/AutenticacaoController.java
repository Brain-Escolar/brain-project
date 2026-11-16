package br.com.brain.autenticacao;

import br.com.brain.autenticacao.dto.RefreshTokenDto;
import br.com.brain.autenticacao.dto.AccessTokenDto;
import br.com.brain.usuario.dto.AutenticacaoDto;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.escola.EscolaService;
import br.com.brain.escola.dto.EscolaLoginDto;
import br.com.brain.usuario.LinkDeSenhaService;
import br.com.brain.usuario.UsuarioService;
import br.com.brain.usuario.dto.EsqueciSenhaDto;
import br.com.brain.usuario.dto.InformacaoLinkSenhaDto;
import br.com.brain.usuario.dto.NovaSenhaDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/login")
public class AutenticacaoController {

    private final AuthenticationManager manager;
    private final UsuarioService usuarioService;
    private final TokenService tokenService;
    private final EscolaService escolaService;
    private final LinkDeSenhaService linkDeSenhaService;

    @PostMapping
    public ResponseEntity<AccessTokenDto> efetuarLogin(@RequestBody @Valid AutenticacaoDto dados) {
        var tenantId = escolaService.buscarSchemaPorCodigo(dados.codigoEscola());
        TenantContext.setTenantId(tenantId);

        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
        var authentication = manager.authenticate(authenticationToken);
        var tokenAcesso = tokenService.gerarAutenticationToken((DadosAutenticacao) authentication.getPrincipal(), tenantId);
        var refreshToken = tokenService.gerarRefreshToken((DadosAutenticacao) authentication.getPrincipal(), tenantId);

        return ResponseEntity.ok(new AccessTokenDto(tokenAcesso, refreshToken));
    }

    // TEMPORARIO: seletor de escola da tela de login. Remover quando a escola
    // for identificada automaticamente.
    @GetMapping("/escolas")
    public ResponseEntity<List<EscolaLoginDto>> listarEscolas() {
        return ResponseEntity.ok(escolaService.listarAtivasParaLogin());
    }

    /**
     * Público. A escola vem do seletor da tela de login, e a resposta é a mesma
     * exista ou não o login (F5, D48).
     */
    @PostMapping("/esqueci-minha-senha")
    public ResponseEntity<Void> esqueciMinhaSenha(@RequestBody @Valid EsqueciSenhaDto dados) {
        TenantContext.setTenantId(escolaService.buscarSchemaPorCodigo(dados.codigoEscola()));
        usuarioService.esqueciMinhaSenha(dados.email());
        return ResponseEntity.noContent().build();
    }

    /** Público: o que o link de senha vai fazer, para a página mostrar antes de pedir a senha. */
    @GetMapping("/nova-senha")
    public ResponseEntity<InformacaoLinkSenhaDto> informacaoLinkSenha(@RequestParam String token) {
        linkDeSenhaService.aplicarEscola(token);
        return ResponseEntity.ok(linkDeSenhaService.informacao(token));
    }

    /** Público: define a senha pelo link do e-mail. A escola vem dentro do token assinado. */
    @PostMapping("/nova-senha")
    public ResponseEntity<Void> definirSenha(@RequestBody @Valid NovaSenhaDto dados) {
        linkDeSenhaService.aplicarEscola(dados.token());
        linkDeSenhaService.definirSenha(dados);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/atualizar-token")
    public ResponseEntity<AccessTokenDto> atualizarToken(@RequestBody @Valid RefreshTokenDto dados) {
        var tenantId = tokenService.getTenantId(dados.refreshToken());
        TenantContext.setTenantId(tenantId);

        var usuarioId = Long.valueOf(tokenService.getSubject(dados.refreshToken()));
        var usuario = usuarioService.recuperarUsuarioPorId(usuarioId);

        var tokenAcesso = tokenService.gerarAutenticationToken(usuario, tenantId);
        var refreshToken = tokenService.gerarRefreshToken(usuario, tenantId);

        return ResponseEntity.ok(new AccessTokenDto(tokenAcesso, refreshToken));
    }
}
