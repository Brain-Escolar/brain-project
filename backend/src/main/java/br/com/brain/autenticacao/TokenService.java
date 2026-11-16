package br.com.brain.autenticacao;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;

import br.com.brain.exception.ErrosSistema;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    public String gerarAutenticationToken(DadosAutenticacao usuario, String tenantId) {
        try {
            var algoritmo = Algorithm.HMAC256(secret); // TODO - trocar algoritmo para chave publica/privada
            return JWT.create()
                    .withIssuer("API Brain")
                    .withSubject(usuario.getUsername())
                    .withClaim("id", usuario.getId())
                    .withClaim("role", usuario.getAuthorities().toString())
                    .withClaim("name", usuario.getSocialName())
                    .withClaim("dadosPessoaisId",
                            usuario.getDadosPessoais() != null ? usuario.getDadosPessoais().getId() : null)
                    .withClaim("tenantId", tenantId)
                    .withExpiresAt(expiracao(30))
                    .sign(algoritmo);
        } catch (JWTCreationException exception) {
            throw new ErrosSistema.ErroInternoException("Erro ao gerar token JWT", exception);
        }
    }

    public String gerarRefreshToken(DadosAutenticacao usuario, String tenantId) {
        try {
            var algoritmo = Algorithm.HMAC256(secret); // TODO - trocar algoritmo para chave publica/privada
            return JWT.create()
                    .withIssuer("API Brain")
                    .withSubject(usuario.getId().toString())
                    .withClaim("tenantId", tenantId)
                    .withExpiresAt(expiracao(120))
                    .sign(algoritmo);
        } catch (JWTCreationException exception) {
            throw new ErrosSistema.ErroInternoException("Erro ao gerar token JWT", exception);
        }
    }

    public String getSubject(String tokenJWT) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return JWT.require(algoritmo).withIssuer("API Brain").build().verify(tokenJWT).getSubject();
        } catch (JWTVerificationException exception) {
            throw new ErrosSistema.TokenInvalidoOuExpiradoException("Token JWT inválido ou expirado!");
        }
    }

    public String getTenantId(String tokenJWT) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return JWT.require(algoritmo).withIssuer("API Brain").build().verify(tokenJWT).getClaim("tenantId")
                    .asString();
        } catch (JWTVerificationException exception) {
            throw new ErrosSistema.TokenInvalidoOuExpiradoException("Token JWT inválido ou expirado!");
        }
    }

    /**
     * Link de definir ou redefinir senha (D48). Leva a escola e o login dentro
     * do token assinado, para a página pública não depender de parâmetro na URL.
     * O emissor é outro, então este token não serve para autenticar e um token
     * de acesso não serve aqui.
     */
    public String gerarTokenSenha(Long loginId, String tenantId, String codigo, String finalidade,
            Instant expiracao) {
        try {
            return JWT.create()
                    .withIssuer(EMISSOR_SENHA)
                    .withSubject(loginId.toString())
                    .withClaim("tenantId", tenantId)
                    .withClaim("codigo", codigo)
                    .withClaim("finalidade", finalidade)
                    .withExpiresAt(expiracao)
                    .sign(Algorithm.HMAC256(secret));
        } catch (JWTCreationException exception) {
            throw new ErrosSistema.ErroInternoException("Erro ao gerar o link de senha", exception);
        }
    }

    public TokenSenha lerTokenSenha(String token) {
        try {
            var jwt = JWT.require(Algorithm.HMAC256(secret)).withIssuer(EMISSOR_SENHA).build().verify(token);
            return new TokenSenha(Long.valueOf(jwt.getSubject()), jwt.getClaim("tenantId").asString(),
                    jwt.getClaim("codigo").asString(), jwt.getClaim("finalidade").asString());
        } catch (JWTVerificationException | NumberFormatException exception) {
            throw new ErrosSistema.TokenInvalidoOuExpiradoException(
                    "Este link é inválido ou expirou. Peça um novo.");
        }
    }

    public record TokenSenha(Long loginId, String tenantId, String codigo, String finalidade) {
    }

    private static final String EMISSOR_SENHA = "API Brain - senha";

    private Instant expiracao(long minutes) {
        return LocalDateTime.now().plusMinutes(minutes).toInstant(ZoneOffset.of("-03:00"));
    }
}
