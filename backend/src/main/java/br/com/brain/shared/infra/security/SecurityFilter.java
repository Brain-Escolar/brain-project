package br.com.brain.shared.infra.security;

import br.com.brain.autenticacao.domain.DadosAutenticacaoRepository;
import br.com.brain.shared.infra.multitenancy.TenantContext;
import br.com.brain.autenticacao.services.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.domain.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private DadosAutenticacaoRepository repository;

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
                var usuario = repository.findByEmailIgnoreCaseAndVerificadoTrue(subject).orElseThrow();

                var authentication = new UsernamePasswordAuthenticationToken(usuario, null, usuario.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null) {
            return authorizationHeader.replace("Bearer ", "");
        }

        return null;
    }
}
