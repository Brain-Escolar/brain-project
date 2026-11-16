package br.com.brain.usuario.gestao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.perfil.Perfil;
import br.com.brain.permissao.PermissoesUsuarioService;

import java.util.EnumSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

/**
 * Checagem "perfil gestor OU controle" das ações da tela de Usuários
 * (docs/permissoes.md, D44), no molde do PerfilOuTela (D26). ADMIN e DIRETOR
 * passam pelo perfil, sempre (U12). Qualquer outro perfil passa só se tiver o
 * controle por um grupo: o código nunca testa "é secretaria", testa o controle.
 *
 * A tela em si é guardada na URL pelo SecurityConfigurations (/usuarios/**).
 * Aqui ficam o controle de cada ação e a trava RU1 (ninguém altera o próprio
 * acesso). O alcance (sobre quem) fica no AlcanceGestaoUsuarios.
 */
@Component
@RequiredArgsConstructor
public class AcessoGestaoUsuarios {

    private final PermissoesUsuarioService permissoesService;

    public static Set<PerfilNome> perfis(DadosAutenticacao usuario) {
        var pessoa = usuario == null ? null : usuario.getDadosPessoais();
        if (pessoa == null) {
            return EnumSet.noneOf(PerfilNome.class);
        }
        return pessoa.getPerfis().stream()
                .map(Perfil::getNome)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(PerfilNome.class)));
    }

    public boolean temControle(DadosAutenticacao usuario, String controle) {
        return AlcanceGestaoUsuarios.ehGestor(perfis(usuario)) || permissoesService.temControle(usuario, controle);
    }

    public void exigirControle(DadosAutenticacao usuario, String controle) {
        if (!temControle(usuario, controle)) {
            throw new ErrosSistema.AcessoNegadoException("Você não tem permissão para esta ação na tela de Usuários.");
        }
    }

    /** RU1: ninguém mexe no próprio login, perfis, grupos ou acessos individuais. */
    public static boolean ehOProprio(DadosAutenticacao usuario, Long dadosPessoaisId) {
        return usuario != null && usuario.getDadosPessoais() != null
                && Objects.equals(usuario.getDadosPessoais().getId(), dadosPessoaisId);
    }

    public static final String MOTIVO_PROPRIO = "Ninguém altera o próprio acesso. Peça a outra pessoa da gestão.";
}
