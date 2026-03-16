package br.com.brain.controller;

import br.com.brain.service.TokenService;
import br.com.brain.service.google.LoginGoogleService;
import br.com.brain.domain.autenticacao.DadosAutenticacao;
import br.com.brain.domain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dto.token.AccessTokenDto;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/login/google")
public class GoogleLoginController {

    private final LoginGoogleService loginGoogleService;
    private final DadosAutenticacaoRepository usuarioRepository;
    private final TokenService tokenService;

    public GoogleLoginController(LoginGoogleService loginGoogleService, DadosAutenticacaoRepository usuarioRepository,
            TokenService tokenService) {
        this.loginGoogleService = loginGoogleService;
        this.usuarioRepository = usuarioRepository;
        this.tokenService = tokenService;
    }

    @GetMapping
    public ResponseEntity<Void> redirecionarGoogle() {
        var url = loginGoogleService.gerarUrl();

        var headers = new HttpHeaders();
        headers.setLocation(URI.create(url));

        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/autorizado")
    public ResponseEntity<AccessTokenDto> autenticarUsuarioOAuth(@RequestParam String code) {
        var oAuth = loginGoogleService.obterOAuthGoogle(code);
        var email = loginGoogleService.obterEmail(oAuth);

        var usuario = usuarioRepository.findByEmailIgnoreCaseAndVerificadoTrue(email)
                .orElseThrow();
        loginGoogleService.salvarGoogleAccessToken(oAuth, usuario);
        var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String tokenAcesso = tokenService.gerarAutenticationToken((DadosAutenticacao) authentication.getPrincipal());
        String refreshToken = tokenService.gerarRefreshToken((DadosAutenticacao) authentication.getPrincipal());

        return ResponseEntity.ok(new AccessTokenDto(tokenAcesso, refreshToken));
    }
}
