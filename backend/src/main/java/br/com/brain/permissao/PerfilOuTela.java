package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;

import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.access.hierarchicalroles.NullRoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.authorization.AuthorityAuthorizationManager;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.authorization.AuthorizationManagers;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;

/**
 * Regra de URL "tem um destes perfis OU alguma destas telas liberada"
 * (docs/permissoes.md, D26), para as áreas que o SecurityConfigurations já
 * restringia por perfil.
 *
 * Só libera: quem entrava pelo perfil continua entrando, e quem ganhou a tela
 * por um grupo ou pelo acesso individual passa a entrar também. Não é o
 * bloqueio da fase F3, que vai exigir a permissão de todo mundo. O perfil é
 * testado primeiro, para não consultar o banco de quem já entra por ele, e
 * segue a hierarquia de perfis do SecurityConfigurations (o diretor entra onde
 * a secretaria entra), como o hasRole fazia.
 */
@Component
@RequiredArgsConstructor
public class PerfilOuTela {

    private final PermissoesUsuarioService permissoesService;
    // Provider: a hierarquia é um bean do SecurityConfigurations, que depende desta classe.
    private final ObjectProvider<RoleHierarchy> hierarquia;

    public AuthorizationManager<RequestAuthorizationContext> regra(List<String> perfis, String... telas) {
        var codigos = Set.of(telas);
        return perfilOu(perfis, usuario -> permissoesService.temAlgumaTela(usuario, codigos));
    }

    /**
     * O mesmo para uma ação dentro da tela: abrir o financeiro não dá direito a
     * estornar; fora dos perfis, só entra quem ganhou o controle (D39).
     */
    public AuthorizationManager<RequestAuthorizationContext> regraDeControle(List<String> perfis, String controle) {
        return perfilOu(perfis, usuario -> permissoesService.temControle(usuario, controle));
    }

    private AuthorizationManager<RequestAuthorizationContext> perfilOu(List<String> perfis,
            Predicate<DadosAutenticacao> liberado) {
        AuthorizationManager<RequestAuthorizationContext> porPermissao = (autenticacao, contexto) -> {
            var atual = autenticacao.get();
            return new AuthorizationDecision(atual != null
                    && atual.getPrincipal() instanceof DadosAutenticacao usuario
                    && liberado.test(usuario));
        };
        var porPerfil = AuthorityAuthorizationManager.<RequestAuthorizationContext>hasAnyRole(
                perfis.toArray(String[]::new));
        porPerfil.setRoleHierarchy(hierarquia.getIfAvailable(NullRoleHierarchy::new));
        return AuthorizationManagers.anyOf(porPerfil, porPermissao);
    }
}
