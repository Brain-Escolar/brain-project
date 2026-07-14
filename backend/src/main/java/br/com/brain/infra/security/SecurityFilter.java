package br.com.brain.infra.security;

import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.exception.ApiError;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.autenticacao.TokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final TokenService tokenService;

    private final DadosAutenticacaoRepository repository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            var tokenJWT = recuperarToken(request);

            if (tokenJWT != null) {
                var tenantId = tokenService.getTenantId(tokenJWT);
                TenantContext.setTenantId(tenantId);

                var subject = tokenService.getSubject(tokenJWT);
                var usuario = repository.findByEmailIgnoreCaseAndVerificadoTrue(subject)
                        .orElseThrow(() -> new ErrosSistema.TokenInvalidoOuExpiradoException(
                                "Token inválido ou expirado"));

                var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            filterChain.doFilter(request, response);
        } catch (ErrosSistema.TokenInvalidoOuExpiradoException ex) {
            responderErro(response, HttpServletResponse.SC_UNAUTHORIZED, "TOKEN_INVALIDO_OU_EXPIRADO",
                    ex.getMessage(), request.getRequestURI());
        } finally {
            TenantContext.clear();
        }
    }

    private void responderErro(HttpServletResponse response, int status, String codigo, String mensagem,
            String path) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(OBJECT_MAPPER.writeValueAsString(ApiError.of(codigo, mensagem, path)));
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null) {
            return authorizationHeader.replace("Bearer ", "");
        }

        return null;
    }
}
