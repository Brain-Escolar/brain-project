package br.com.brain.usuario.gestao;

import br.com.brain.aluno.AlunoRepository;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.autenticacao.MotivoDesativacao;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.permissao.ControlesDeGestao;
import br.com.brain.permissao.GrupoUsuarioMembroRepository;
import br.com.brain.permissao.GrupoUsuarioRepository;
import br.com.brain.permissao.VinculoDeGrupo;
import br.com.brain.professor.ProfessorRepository;
import br.com.brain.responsavel.ResponsavelRepository;
import br.com.brain.secretario.SecretarioRepository;
import br.com.brain.usuario.LinkDeSenhaService;
import br.com.brain.usuario.gestao.dto.AcessoDoPerfilDto;
import br.com.brain.usuario.gestao.dto.AcessoEfetivoDto;
import br.com.brain.usuario.gestao.dto.AcoesLoginDto;
import br.com.brain.usuario.gestao.dto.FiltroUsuariosDto;
import br.com.brain.usuario.gestao.dto.GrupoDoUsuarioDto;
import br.com.brain.usuario.gestao.dto.GrupoFiltroDto;
import br.com.brain.usuario.gestao.dto.OrigemCadastroDto;
import br.com.brain.usuario.gestao.dto.PerfilDeFuncaoDto;
import br.com.brain.usuario.gestao.dto.SecoesDto;
import br.com.brain.usuario.gestao.dto.UsuarioDetalheDto;
import br.com.brain.usuario.gestao.dto.UsuarioListaDto;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tela de Usuários: lista, cabeçalho, ações de login e acesso efetivo
 * (docs/permissoes.md, seção 8.7). Conceder e remover perfil fica no
 * PerfisUsuarioService.
 *
 * A tela não cria pessoas nem logins: aluno, professor, responsável e
 * secretário continuam nascendo nas telas de cada área. Aqui se administra o
 * login de quem já tem. Não há excluir: o login se desativa (U4).
 */
@Service
@RequiredArgsConstructor
public class GestaoUsuariosService {

    private final DadosAutenticacaoRepository loginRepository;
    private final GrupoUsuarioMembroRepository membroRepository;
    private final GrupoUsuarioRepository grupoRepository;
    private final AlunoRepository alunoRepository;
    private final ProfessorRepository professorRepository;
    private final SecretarioRepository secretarioRepository;
    private final ResponsavelRepository responsavelRepository;
    private final AcessoGestaoUsuarios acesso;
    private final LinkDeSenhaService linkDeSenhaService;
    private final AcessoEfetivoCalculo calculo;

    // ------------------------------------------------------------- leitura

    @Transactional(readOnly = true)
    public Page<UsuarioListaDto> listar(FiltroUsuariosDto filtro, Pageable pageable) {
        var pagina = loginRepository.findAll(FiltrosUsuarios.de(filtro), pageable);
        var ids = pagina.getContent().stream().map(login -> login.getDadosPessoais().getId()).toList();
        Map<Long, List<VinculoDeGrupo>> vinculos = ids.isEmpty() ? Map.of()
                : membroRepository.findVinculosDe(ids).stream()
                        .collect(Collectors.groupingBy(VinculoDeGrupo::dadosPessoaisId));
        return pagina.map(login -> linha(login, vinculos.getOrDefault(login.getDadosPessoais().getId(), List.of())));
    }

    /** Grupos normais, para o filtro da lista. Os individuais não são grupos para quem vê (D18). */
    @Transactional(readOnly = true)
    public List<GrupoFiltroDto> gruposParaFiltro() {
        return grupoRepository.findTodosComPerfil().stream()
                .map(g -> new GrupoFiltroDto(g.getId(), g.getNome(), g.getPerfil().getNome(),
                        Boolean.TRUE.equals(g.getAtivo())))
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioDetalheDto detalhar(Long dadosPessoaisId, DadosAutenticacao quemVe) {
        var login = buscar(dadosPessoaisId);
        var pessoa = login.getDadosPessoais();
        var perfis = AcessoGestaoUsuarios.perfis(login);
        return new UsuarioDetalheDto(pessoa.getId(), pessoa.getNome(), pessoa.getNomeSocial(), login.getEmail(),
                mascarar(LinkDeSenhaService.emailPessoal(login)), ordenados(perfis), login.getSituacao(),
                login.getMotivoDesativacao(), origens(pessoa.getId()), acoes(login, quemVe),
                new SecoesDto(acesso.temControle(quemVe, ControlesDeGestao.ACESSOS_VER),
                        acesso.temControle(quemVe, ControlesDeGestao.PERFIS_GERENCIAR)),
                perfisDeFuncao(login, quemVe));
    }

    /**
     * O que a pessoa abre em cada perfil, com a origem de cada item, e o que o
     * perfil abre direto no servidor (USUARIO.ACESSOS.VER). Não tem trava do
     * próprio: ver não altera nada.
     */
    @Transactional(readOnly = true)
    public AcessoEfetivoDto acessoEfetivo(Long dadosPessoaisId, DadosAutenticacao quemVe) {
        acesso.exigirControle(quemVe, ControlesDeGestao.ACESSOS_VER);
        var login = buscar(dadosPessoaisId);
        var perfis = AcessoGestaoUsuarios.perfis(login);
        var vinculos = membroRepository.findVinculosDe(List.of(dadosPessoaisId));

        var blocos = perfis.stream().sorted().map(perfil -> {
            if (perfil == PerfilNome.ADMIN) {
                var itens = calculo.tetoDoAdmin();
                return new AcessoDoPerfilDto(perfil, true, List.of(), false, itens.telas(), itens.controles(),
                        AcessoEfetivoCalculo.servidor(perfil));
            }
            var doPerfil = vinculos.stream().filter(v -> v.perfil() == perfil).toList();
            var itens = calculo.dosGrupos(perfil, doPerfil);
            return new AcessoDoPerfilDto(perfil, false, gruposNormais(doPerfil),
                    doPerfil.stream().anyMatch(VinculoDeGrupo::individual), itens.telas(), itens.controles(),
                    AcessoEfetivoCalculo.servidor(perfil));
        }).toList();

        var guardados = gruposNormais(vinculos.stream().filter(v -> !perfis.contains(v.perfil())).toList());
        return new AcessoEfetivoDto(dadosPessoaisId, blocos, guardados);
    }

    // ------------------------------------------------------------- ações de login

    /**
     * Desliga o login pela tela (RU8). Vale também para quem ainda não
     * verificou: o link de verificação não o religa (F4). Um login desligado
     * por falta de perfil passa a ser administrativo, e uma rematrícula deixa
     * de religá-lo.
     */
    @Transactional
    public UsuarioDetalheDto desativar(Long dadosPessoaisId, DadosAutenticacao quem) {
        var login = buscarParaAgir(dadosPessoaisId, quem);
        if (login.getMotivoDesativacao() == MotivoDesativacao.ADMINISTRATIVA) {
            throw ErrosSistema.OperacaoInvalidaException.com("Este login já está desativado.");
        }
        if (AcessoGestaoUsuarios.perfis(login).contains(PerfilNome.ADMIN)) {
            garantirOutroAdmin(login);
        }
        login.desativarAdministrativamente();
        loginRepository.save(login);
        return detalhar(dadosPessoaisId, quem);
    }

    /**
     * Desfaz só a desativação administrativa. Quem ficou sem perfil volta pelo
     * cadastro de origem (rematrícula, recontratação), que dá o perfil de novo.
     */
    @Transactional
    public UsuarioDetalheDto reativar(Long dadosPessoaisId, DadosAutenticacao quem) {
        var login = buscarParaAgir(dadosPessoaisId, quem);
        if (login.getMotivoDesativacao() == MotivoDesativacao.SEM_PERFIL) {
            throw ErrosSistema.OperacaoInvalidaException.com("Este login foi desligado porque a pessoa ficou sem "
                    + "nenhum perfil (desmatrícula ou desligamento). Ele volta sozinho quando ela for "
                    + "cadastrada de novo na área de origem.");
        }
        if (!login.reativar(MotivoDesativacao.ADMINISTRATIVA)) {
            throw ErrosSistema.OperacaoInvalidaException.com("Este login não está desativado.");
        }
        loginRepository.save(login);
        return detalhar(dadosPessoaisId, quem);
    }

    /** Novo link de primeiro acesso, que define a senha e verifica o login (D48). */
    @Transactional
    public void reenviarVerificacao(Long dadosPessoaisId, DadosAutenticacao quem) {
        var login = buscarParaAgir(dadosPessoaisId, quem);
        if (login.getMotivoDesativacao() != null) {
            throw ErrosSistema.OperacaoInvalidaException.com("Reative o login antes de reenviar a verificação.");
        }
        if (Boolean.TRUE.equals(login.getVerificado())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Este login já foi verificado. Para trocar a senha, envie a redefinição.");
        }
        linkDeSenhaService.enviar(login, LinkDeSenhaService.Finalidade.DEFINIR);
    }

    /** Link de redefinição para o e-mail pessoal. Sem e-mail pessoal, bloqueia. */
    @Transactional
    public void enviarRedefinicao(Long dadosPessoaisId, DadosAutenticacao quem) {
        var login = buscarParaAgir(dadosPessoaisId, quem);
        if (login.getMotivoDesativacao() != null) {
            throw ErrosSistema.OperacaoInvalidaException.com("Reative o login antes de enviar a redefinição de senha.");
        }
        if (!Boolean.TRUE.equals(login.getVerificado())) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Este login ainda não foi verificado. Reenvie a verificação, que já leva a pessoa a definir a senha.");
        }
        linkDeSenhaService.enviar(login, LinkDeSenhaService.Finalidade.REDEFINIR);
    }

    // ------------------------------------------------------------- regras

    private DadosAutenticacao buscarParaAgir(Long dadosPessoaisId, DadosAutenticacao quem) {
        return buscarParaAgir(dadosPessoaisId, quem, ControlesDeGestao.LOGIN_GERENCIAR);
    }

    /** O controle da ação, RU1 (o próprio) e RU2 (alcance). */
    DadosAutenticacao buscarParaAgir(Long dadosPessoaisId, DadosAutenticacao quem, String controle) {
        acesso.exigirControle(quem, controle);
        var login = buscar(dadosPessoaisId);
        if (AcessoGestaoUsuarios.ehOProprio(quem, dadosPessoaisId)) {
            throw new ErrosSistema.AcessoNegadoException(AcessoGestaoUsuarios.MOTIVO_PROPRIO);
        }
        var foraDoAlcance = AlcanceGestaoUsuarios.motivoForaDoAlcance(AcessoGestaoUsuarios.perfis(quem),
                AcessoGestaoUsuarios.perfis(login));
        if (foraDoAlcance != null) {
            throw new ErrosSistema.AcessoNegadoException(foraDoAlcance);
        }
        return login;
    }

    /**
     * RU7: a escola nunca fica sem ADMIN ativo e verificado. Trava os logins de
     * ADMIN antes de contar, para dois administradores não se desativarem ao
     * mesmo tempo.
     */
    void garantirOutroAdmin(DadosAutenticacao alvo) {
        var travados = loginRepository.travarComPerfil(PerfilNome.ADMIN.name());
        // A desativação de quem age já pode ter sido gravada: lê do banco, não da memória.
        loginRepository.flush();
        var restantes = loginRepository.contarAtivosVerificadosEntre(travados, alvo.getId());
        if (restantes == 0) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A escola ficaria sem nenhum administrador ativo. Ative outro administrador antes.");
        }
    }

    private AcoesLoginDto acoes(DadosAutenticacao login, DadosAutenticacao quemVe) {
        String bloqueio = null;
        if (!acesso.temControle(quemVe, ControlesDeGestao.LOGIN_GERENCIAR)) {
            bloqueio = "Você pode ver este login, mas não alterá-lo.";
        } else if (AcessoGestaoUsuarios.ehOProprio(quemVe, login.getDadosPessoais().getId())) {
            bloqueio = AcessoGestaoUsuarios.MOTIVO_PROPRIO;
        } else {
            bloqueio = AlcanceGestaoUsuarios.motivoForaDoAlcance(AcessoGestaoUsuarios.perfis(quemVe),
                    AcessoGestaoUsuarios.perfis(login));
        }
        if (bloqueio != null) {
            return new AcoesLoginDto(false, false, false, false, bloqueio);
        }
        var motivo = login.getMotivoDesativacao();
        var verificado = Boolean.TRUE.equals(login.getVerificado());
        var temEmail = LinkDeSenhaService.emailPessoal(login) != null;
        return new AcoesLoginDto(
                motivo != MotivoDesativacao.ADMINISTRATIVA,
                motivo == MotivoDesativacao.ADMINISTRATIVA,
                motivo == null && !verificado && temEmail,
                motivo == null && verificado && temEmail,
                null);
    }

    // ------------------------------------------------------------- apoio

    /**
     * Linhas da seção Perfis, com o que quem vê pode fazer em cada uma. Vazia
     * para quem não tem USUARIO.PERFIS.GERENCIAR: a seção nem aparece.
     */
    private List<PerfilDeFuncaoDto> perfisDeFuncao(DadosAutenticacao login, DadosAutenticacao quemVe) {
        if (!acesso.temControle(quemVe, ControlesDeGestao.PERFIS_GERENCIAR)) {
            return List.of();
        }
        var ator = AcessoGestaoUsuarios.perfis(quemVe);
        var alvo = AcessoGestaoUsuarios.perfis(login);
        String geral = AcessoGestaoUsuarios.ehOProprio(quemVe, login.getDadosPessoais().getId())
                ? AcessoGestaoUsuarios.MOTIVO_PROPRIO
                : AlcanceGestaoUsuarios.motivoForaDoAlcance(ator, alvo);
        return RegrasDePerfil.linhas(ator, alvo).stream()
                .map(perfil -> {
                    var tem = alvo.contains(perfil);
                    var bloqueio = geral != null ? geral : motivoNaoAltera(ator, alvo, perfil);
                    return new PerfilDeFuncaoDto(perfil, tem, bloqueio == null, bloqueio);
                })
                .toList();
    }

    /** As regras do próprio perfil, depois do controle, de RU1 e de RU2. */
    static String motivoNaoAltera(Set<PerfilNome> ator, Set<PerfilNome> alvo, PerfilNome perfil) {
        var semPermissao = RegrasDePerfil.motivoSemPermissao(ator, perfil);
        if (semPermissao != null) {
            return semPermissao;
        }
        return alvo.contains(perfil) ? RegrasDePerfil.motivoNaoRemove(alvo, perfil)
                : RegrasDePerfil.motivoNaoConcede(alvo, perfil);
    }

    static List<GrupoDoUsuarioDto> gruposNormais(List<VinculoDeGrupo> vinculos) {
        return vinculos.stream()
                .filter(v -> !v.individual())
                .map(v -> new GrupoDoUsuarioDto(v.grupoId(), v.nome(), v.perfil(), Boolean.TRUE.equals(v.ativo()),
                        Boolean.TRUE.equals(v.padrao())))
                .toList();
    }

    DadosAutenticacao buscar(Long dadosPessoaisId) {
        return loginRepository.findByDadosPessoaisId(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Usuário", dadosPessoaisId));
    }

    private UsuarioListaDto linha(DadosAutenticacao login, List<VinculoDeGrupo> vinculos) {
        var pessoa = login.getDadosPessoais();
        var perfis = AcessoGestaoUsuarios.perfis(login);

        var grupos = gruposNormais(vinculos);
        Set<PerfilNome> comIndividual = vinculos.stream()
                .filter(VinculoDeGrupo::individual)
                .map(VinculoDeGrupo::perfil)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(PerfilNome.class)));
        Set<PerfilNome> comGrupoAtivo = vinculos.stream()
                .filter(v -> Boolean.TRUE.equals(v.ativo()))
                .map(VinculoDeGrupo::perfil)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(PerfilNome.class)));
        var semAcesso = perfis.stream()
                .filter(perfil -> perfil != PerfilNome.ADMIN && !comGrupoAtivo.contains(perfil))
                .sorted()
                .toList();

        return new UsuarioListaDto(pessoa.getId(), pessoa.getNome(), pessoa.getNomeSocial(), login.getEmail(),
                ordenados(perfis), grupos, ordenados(comIndividual), semAcesso, login.getSituacao(),
                login.getMotivoDesativacao());
    }

    private List<OrigemCadastroDto> origens(Long dadosPessoaisId) {
        var origens = new ArrayList<OrigemCadastroDto>();
        alunoRepository.findByDadosPessoaisId(dadosPessoaisId)
                .ifPresent(a -> origens.add(new OrigemCadastroDto(OrigemCadastroDto.Tipo.ALUNO, a.getId())));
        professorRepository.findByDadosPessoaisId(dadosPessoaisId)
                .ifPresent(p -> origens.add(new OrigemCadastroDto(OrigemCadastroDto.Tipo.PROFESSOR, p.getId())));
        secretarioRepository.findFirstByDadosPessoaisId(dadosPessoaisId)
                .ifPresent(s -> origens.add(new OrigemCadastroDto(OrigemCadastroDto.Tipo.SECRETARIO, s.getId())));
        responsavelRepository.findFirstByDadosPessoaisIdOrderByIdAsc(dadosPessoaisId)
                .ifPresent(r -> origens.add(new OrigemCadastroDto(OrigemCadastroDto.Tipo.RESPONSAVEL, r.getId())));
        return origens;
    }

    private static List<PerfilNome> ordenados(Set<PerfilNome> perfis) {
        return perfis.stream().sorted().toList();
    }

    /** "ana.souza@gmail.com" vira "an*******@gmail.com". */
    static String mascarar(String email) {
        if (email == null) {
            return null;
        }
        var arroba = email.indexOf('@');
        if (arroba <= 0) {
            return "***";
        }
        var local = email.substring(0, arroba);
        var visivel = local.length() <= 2 ? local.substring(0, 1) : local.substring(0, 2);
        return visivel + "*".repeat(Math.max(3, local.length() - visivel.length())) + email.substring(arroba);
    }
}
