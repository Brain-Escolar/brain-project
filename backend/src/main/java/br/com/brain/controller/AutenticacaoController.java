package br.com.brain.controller;

import br.com.brain.dto.token.RefreshTokenDto;
import br.com.brain.domain.autenticacao.DadosAutenticacao;
import br.com.brain.dto.autenticacao.EmailDto;
import br.com.brain.dto.token.AccessTokenDto;
import br.com.brain.dto.usuario.AutenticacaoDto;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.service.EscolaService;
import br.com.brain.service.TokenService;
import br.com.brain.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/login")
public class AutenticacaoController {

    private final AuthenticationManager manager;
    private final UsuarioService usuarioService;
    private final TokenService tokenService;
    private final EscolaService escolaService;

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

    @PostMapping("/esqueci-minha-senha")
    public ResponseEntity<String> esqueciMinhaSenha(@RequestBody EmailDto email) {
        usuarioService.esqueciMinhaSenha(email.email());

        return ResponseEntity.ok("Instruções para redefinir a senha foram enviadas para o email.");
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
