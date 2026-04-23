package br.com.brain.shared.infra.audit;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.domain.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAwareImpl")
public class AuditorAwareImpl implements AuditorAware<Long> {

    @Override
    public Optional<Long> getCurrentAuditor() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof DadosAutenticacao usuario)) {
            return Optional.empty();
        }

        var dadosPessoais = usuario.getDadosPessoais();
        if (dadosPessoais == null) {
            return Optional.empty();
        }

        return Optional.ofNullable(dadosPessoais.getId());
    }
}
