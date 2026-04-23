package br.com.brain.google.services;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.auth0.jwt.JWT;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import br.com.brain.usuario.services.UsuarioService;

@Service
public class LoginGoogleService {
    @Value("${google.oauth.client.id}")
    private String clientId;
    @Value("${google.oauth.client.secret}")
    private String clientSecret;
    @Value("${site.url}")
    private String siteUrl;
    private final String redirectUri = "/login/google/autorizado";

    private final RestClient restClient;
    private final UsuarioService usuarioService;

    public LoginGoogleService(RestClient.Builder restClientBuilder, UsuarioService usuarioService) {
        this.restClient = restClientBuilder.build();
        this.usuarioService = usuarioService;
    }

    public String gerarUrl(String codigoEscola) {
        return "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + clientId +
                "&redirect_uri=" + siteUrl + redirectUri +
                "&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/calendar+https://www.googleapis.com/auth/calendar.events"
                +
                "&access_type=offline" +
                "&response_type=code" +
                "&state=" + codigoEscola;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> obterOAuthGoogle(String code) {
        var resposta = restClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of("code", code, "client_id", clientId,
                        "client_secret", clientSecret, "redirect_uri", siteUrl + redirectUri,
                        "grant_type", "authorization_code"))
                .retrieve()
                .body(Map.class);
        return resposta;
    }

    public String obterEmail(Map<String, Object> oAuth) {
        if (oAuth.get("id_token") == null) {
            throw new RuntimeException("Erro ao obter o token de autenticação do Google.");
        }
        var token = oAuth.get("id_token").toString();

        var decodedJWT = JWT.decode(token);
        return decodedJWT.getClaim("email").asString();
    }

    public void salvarGoogleAccessToken(Map<String, Object> oAuth, DadosAutenticacao usuario) {
        usuarioService.salvarGoogleAccessToken(oAuth, usuario);
    }
}
