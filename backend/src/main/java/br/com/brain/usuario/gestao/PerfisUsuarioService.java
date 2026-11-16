package br.com.brain.usuario.gestao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.crm.ProcessoMatriculaRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.enums.StatusProcessoMatricula;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.permissao.ControlesDeGestao;
import br.com.brain.permissao.GrupoUsuarioMembroRepository;
import br.com.brain.permissao.GrupoUsuarioRepository;
import br.com.brain.permissao.VinculoDeGrupo;
import br.com.brain.secretario.Secretario;
import br.com.brain.secretario.SecretarioRepository;
import br.com.brain.usuario.UsuarioService;
import br.com.brain.usuario.gestao.dto.GrupoDoUsuarioDto;
import br.com.brain.usuario.gestao.dto.PreviaPerfilDto;
import br.com.brain.usuario.gestao.dto.UsuarioDetalheDto;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Conceder e remover os perfis de função na tela de Usuários (docs/permissoes.md,
 * D50, RU3 a RU6, RU9 e RU10). Só DIRETOR, ORIENTADOR e SECRETARIO, e o ADMIN
 * para quem é ADMIN (U7, U13). ESTUDANTE, RESPONSAVEL e PROFESSOR continuam
 * nos cadastros de origem.
 *
 * A mudança vale na hora no servidor, que lê os perfis do banco a cada
 * requisição. O menu da pessoa só muda no próximo login, porque o perfil vai
 * no token.
 */
@Service
@RequiredArgsConstructor
public class PerfisUsuarioService {

    private final GestaoUsuariosService gestaoService;
    private final AcessoGestaoUsuarios acesso;
    private final AcessoEfetivoCalculo calculo;
    private final UsuarioService usuarioService;
    private final DadosAutenticacaoRepository loginRepository;
    private final GrupoUsuarioMembroRepository membroRepository;
    private final GrupoUsuarioRepository grupoRepository;
    private final SecretarioRepository secretarioRepository;
    private final ProcessoMatriculaRepository processoRepository;

    /** O que muda ao conceder (se a pessoa não tem o perfil) ou remover (se tem). */
    @Transactional(readOnly = true)
    public PreviaPerfilDto previa(Long dadosPessoaisId, PerfilNome perfil, DadosAutenticacao quem) {
        acesso.exigirControle(quem, ControlesDeGestao.PERFIS_GERENCIAR);
        var login = gestaoService.buscar(dadosPessoaisId);
        var alvo = AcessoGestaoUsuarios.perfis(login);
        var bloqueio = bloqueio(login, quem, perfil);
        var vinculos = membroRepository.findVinculosDe(List.of(dadosPessoaisId)).stream()
                .filter(v -> v.perfil() == perfil)
                .toList();
        var servidor = AcessoEfetivoCalculo.servidor(perfil);

        if (alvo.contains(perfil)) {
            var itens = perfil == PerfilNome.ADMIN ? calculo.tetoDoAdmin() : calculo.dosGrupos(perfil, vinculos);
            var outros = loginRepository.contarAtivosComPerfilExceto(perfil, dadosPessoaisId);
            Long leads = perfil == PerfilNome.SECRETARIO
                    ? processoRepository.countByStatusAndFuncionarioId(StatusProcessoMatricula.ATIVO, dadosPessoaisId)
                    : null;
            return new PreviaPerfilDto(perfil, false, bloqueio, List.of(), null, false,
                    perfil == PerfilNome.ADMIN, false, outros == 0, leads, itens.telas(), itens.controles(), servidor);
        }

        var criaSecretario = perfil == PerfilNome.SECRETARIO
                && !secretarioRepository.existsByDadosPessoaisId(dadosPessoaisId);
        if (perfil == PerfilNome.ADMIN) {
            var itens = calculo.tetoDoAdmin();
            return new PreviaPerfilDto(perfil, true, bloqueio, List.of(), null, false, true, false, false, null,
                    itens.telas(), itens.controles(), servidor);
        }

        // RU3: quem já teve o perfil volta aos grupos de antes e não entra no padrão.
        var gruposQueVoltam = GestaoUsuariosService.gruposNormais(vinculos);
        var individualVolta = vinculos.stream().anyMatch(VinculoDeGrupo::individual);
        GrupoDoUsuarioDto padrao = null;
        var grupos = new ArrayList<>(vinculos);
        if (gruposQueVoltam.isEmpty()) {
            var doPerfil = grupoRepository.findPadraoDoPerfil(perfil).orElse(null);
            if (doPerfil != null) {
                padrao = new GrupoDoUsuarioDto(doPerfil.getId(), doPerfil.getNome(), perfil,
                        Boolean.TRUE.equals(doPerfil.getAtivo()), true);
                grupos.add(new VinculoDeGrupo(dadosPessoaisId, doPerfil.getId(), doPerfil.getNome(), perfil,
                        doPerfil.getAtivo(), true, null));
            }
        }
        var itens = calculo.dosGrupos(perfil, grupos);
        return new PreviaPerfilDto(perfil, true, bloqueio, gruposQueVoltam, padrao, individualVolta, false,
                criaSecretario, false, null, itens.telas(), itens.controles(), servidor);
    }

    /**
     * Dá o perfil. A pessoa entra no grupo padrão só se não tiver nenhum grupo
     * normal no perfil (RU3, no GrupoPadraoService). SECRETARIO cria o registro
     * do CRM na mesma transação, porque a equipe do CRM vem dele (RU9).
     */
    @Transactional
    public UsuarioDetalheDto conceder(Long dadosPessoaisId, PerfilNome perfil, DadosAutenticacao quem) {
        var login = gestaoService.buscarParaAgir(dadosPessoaisId, quem, ControlesDeGestao.PERFIS_GERENCIAR);
        var alvo = AcessoGestaoUsuarios.perfis(login);
        exigir(AcessoGestaoUsuarios.perfis(quem), alvo, perfil, true);

        var pessoa = login.getDadosPessoais();
        usuarioService.concederPerfil(pessoa, perfil, null);
        if (perfil == PerfilNome.SECRETARIO && !secretarioRepository.existsByDadosPessoaisId(pessoa.getId())) {
            var secretario = new Secretario();
            secretario.setDadosPessoais(pessoa);
            secretarioRepository.save(secretario);
        }
        return gestaoService.detalhar(dadosPessoaisId, quem);
    }

    /**
     * Tira o perfil. Os grupos ficam guardados e voltam se o perfil voltar
     * (RU4). Não tira o último perfil (RU5), nem o ADMIN do último
     * administrador ativo (RU7). O registro de secretário fica: o CRM monta a
     * equipe por quem tem o perfil e o login ativo (RU9).
     */
    @Transactional
    public UsuarioDetalheDto remover(Long dadosPessoaisId, PerfilNome perfil, DadosAutenticacao quem) {
        var login = gestaoService.buscarParaAgir(dadosPessoaisId, quem, ControlesDeGestao.PERFIS_GERENCIAR);
        var alvo = AcessoGestaoUsuarios.perfis(login);
        exigir(AcessoGestaoUsuarios.perfis(quem), alvo, perfil, false);

        if (perfil == PerfilNome.ADMIN) {
            gestaoService.garantirOutroAdmin(login);
        }
        usuarioService.revogarPerfil(login.getDadosPessoais(), perfil);
        return gestaoService.detalhar(dadosPessoaisId, quem);
    }

    private void exigir(Set<PerfilNome> ator, Set<PerfilNome> alvo, PerfilNome perfil,
            boolean conceder) {
        var semPermissao = RegrasDePerfil.motivoSemPermissao(ator, perfil);
        if (semPermissao != null) {
            throw new ErrosSistema.AcessoNegadoException(semPermissao);
        }
        var invalido = conceder ? RegrasDePerfil.motivoNaoConcede(alvo, perfil)
                : RegrasDePerfil.motivoNaoRemove(alvo, perfil);
        if (invalido != null) {
            throw ErrosSistema.OperacaoInvalidaException.com(invalido);
        }
    }

    /** O mesmo bloqueio da linha da seção Perfis, para o diálogo explicar. */
    private String bloqueio(DadosAutenticacao login, DadosAutenticacao quem, PerfilNome perfil) {
        if (AcessoGestaoUsuarios.ehOProprio(quem, login.getDadosPessoais().getId())) {
            return AcessoGestaoUsuarios.MOTIVO_PROPRIO;
        }
        var ator = AcessoGestaoUsuarios.perfis(quem);
        var alvo = AcessoGestaoUsuarios.perfis(login);
        var foraDoAlcance = AlcanceGestaoUsuarios.motivoForaDoAlcance(ator, alvo);
        return foraDoAlcance != null ? foraDoAlcance : GestaoUsuariosService.motivoNaoAltera(ator, alvo, perfil);
    }
}
