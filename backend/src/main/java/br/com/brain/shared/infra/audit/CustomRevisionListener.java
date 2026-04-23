package br.com.brain.shared.infra.audit;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import org.hibernate.envers.RevisionListener;
import org.springframework.security.domain.context.SecurityContextHolder;

public class CustomRevisionListener implements RevisionListener {

    @Override
    public void newRevision(Object revisionEntity) {
        var revision = (CustomRevisionEntity) revisionEntity;
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof DadosAutenticacao usuario
                && usuario.getDadosPessoais() != null) {
            revision.setUsuarioId(usuario.getDadosPessoais().getId());
        }
    }
}
