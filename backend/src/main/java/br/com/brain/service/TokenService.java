package br.com.brain.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;

import br.com.brain.domain.autenticacao.DadosAutenticacao;
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
            throw new ErrosSistema.ErroInternoException("Token JWT inválido ou expirado!", exception);
        }
    }

    public String getTenantId(String tokenJWT) {
        try {
            var algoritmo = Algorithm.HMAC256(secret);
            return JWT.require(algoritmo).withIssuer("API Brain").build().verify(tokenJWT).getClaim("tenantId")
                    .asString();
        } catch (JWTVerificationException exception) {
            throw new ErrosSistema.ErroInternoException("Token JWT inválido ou expirado!", exception);
        }
    }

    private Instant expiracao(long minutes) {
        return LocalDateTime.now().plusMinutes(minutes).toInstant(ZoneOffset.of("-03:00"));
    }
}
