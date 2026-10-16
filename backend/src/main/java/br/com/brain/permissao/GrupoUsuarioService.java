package br.com.brain.permissao;

import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.perfil.Perfil;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.dto.AcessoATelaDto;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;
import br.com.brain.permissao.dto.AcessosIndividuaisDto;
import br.com.brain.permissao.dto.AdicaoMembrosDto;
import br.com.brain.permissao.dto.AtualizacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.permissao.dto.DetalhamentoGrupoUsuarioDto;
import br.com.brain.permissao.dto.DuplicacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.GrupoDaPessoaDto;
import br.com.brain.permissao.dto.ListagemGrupoUsuarioDto;
import br.com.brain.permissao.dto.MembroGrupoDto;
import br.com.brain.permissao.dto.PessoaGrupoDto;
import br.com.brain.permissao.dto.TelaResumoDto;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Grupos de acesso: criação, acessos, membros e acessos individuais
 * (docs/permissoes.md). Só cuida da configuração; quem calcula o que cada
 * pessoa pode é o PermissoesUsuarioService.
 *
 * Acesso individual é um grupo de uma pessoa só (GrupoUsuario.dadosPessoais),
 * criado no primeiro acesso dado e apagado quando fica vazio. Os endpoints
 * de grupo normal não o enxergam: buscar(id) responde 404 para ele.
 *
 * Toda remoção de vínculo passa pelo JPA, uma entidade por vez, e não por
 * delete em lote ou cascade no banco: é o que deixa o Envers registrar quem
 * tirou o acesso de quem.
 */
@Service
@RequiredArgsConstructor
public class GrupoUsuarioService {

    private static final int TAMANHO_MAXIMO_PAGINA = 100;

    private final GrupoUsuarioRepository grupoRepository;
    private final GrupoUsuarioTelaRepository grupoTelaRepository;
    private final GrupoUsuarioControleRepository grupoControleRepository;
    private final GrupoUsuarioMembroRepository membroRepository;
    private final PerfilRepository perfilRepository;
    private final DadosPessoaisRepository dadosPessoaisRepository;
    private final CatalogoPermissaoService catalogoService;

    @Transactional(readOnly = true)
    public List<ListagemGrupoUsuarioDto> listar(PerfilNome perfil) {
        var membros = porGrupo(membroRepository.contarPorGrupo());
        var telas = porGrupo(grupoTelaRepository.contarPorGrupo());
        var controles = porGrupo(grupoControleRepository.contarPorGrupo());

        return grupoRepository.findTodosComPerfil().stream()
                .filter(grupo -> perfil == null || grupo.getPerfil().getNome() == perfil)
                .map(grupo -> new ListagemGrupoUsuarioDto(
                        grupo.getId(),
                        grupo.getNome(),
                        grupo.getDescricao(),
                        grupo.getPerfil().getNome(),
                        ehPadrao(grupo),
                        Boolean.TRUE.equals(grupo.getAtivo()),
                        membros.getOrDefault(grupo.getId(), 0L),
                        telas.getOrDefault(grupo.getId(), 0L),
                        controles.getOrDefault(grupo.getId(), 0L)))
                .toList();
    }

    @Transactional(readOnly = true)
    public DetalhamentoGrupoUsuarioDto detalhar(Long id) {
        return detalhamento(buscar(id));
    }

    /** Catálogo de telas para a busca da aba "Por tela": independe de perfil. */
    @Transactional(readOnly = true)
    public List<TelaResumoDto> telas() {
        return catalogoService.telas();
    }

    /**
     * Grupos e acessos individuais, de qualquer perfil, que concedem a tela
     * (aba "Por tela"). Não aplica a RP1 inteira: mostra também grupo inativo
     * ou grupo de um perfil que a pessoa já perdeu, para a tela avisar que a
     * concessão existe mas não produz efeito.
     */
    @Transactional(readOnly = true)
    public List<AcessoATelaDto> buscarPorTela(String codigoTela) {
        var membros = porGrupo(membroRepository.contarPorGrupo());
        return grupoRepository.findComTelaConcedida(codigoTela).stream()
                .map(grupo -> new AcessoATelaDto(
                        grupo.getId(),
                        grupo.getDadosPessoais() != null ? grupo.getDadosPessoais().getNome() : grupo.getNome(),
                        grupo.getPerfil().getNome(),
                        grupo.getDadosPessoais() != null,
                        Boolean.TRUE.equals(grupo.getAtivo()),
                        membros.getOrDefault(grupo.getId(), 0L)))
                .toList();
    }

    @Transactional
    public DetalhamentoGrupoUsuarioDto cadastrar(CadastroGrupoUsuarioDto dados) {
        var perfil = perfilComGrupo(dados.perfil());
        var nome = dados.nome().trim();
        exigirNomeLivre(perfil.getId(), nome, null);

        var grupo = grupoRepository.save(new GrupoUsuario(perfil, nome, limpar(dados.descricao())));
        return detalhamento(grupo);
    }

    @Transactional
    public DetalhamentoGrupoUsuarioDto atualizar(Long id, AtualizacaoGrupoUsuarioDto dados) {
        var grupo = buscar(id);
        var nome = dados.nome().trim();
        exigirNomeLivre(grupo.getPerfil().getId(), nome, grupo.getId());

        // RV7: desativar o padrão deixaria o perfil sem o grupo de referência.
        if (ehPadrao(grupo) && !dados.ativo()) {
            throw ErrosSistema.OperacaoInvalidaException.com("O grupo padrão não pode ser desativado.");
        }

        grupo.setNome(nome);
        grupo.setDescricao(limpar(dados.descricao()));
        grupo.setAtivo(dados.ativo());
        return detalhamento(grupo);
    }

    /** Substitui as telas e os controles do grupo pelo conjunto enviado. */
    @Transactional
    public DetalhamentoGrupoUsuarioDto salvarAcessos(Long id, AcessosGrupoUsuarioDto dados) {
        var grupo = buscar(id);
        var teto = catalogoService.teto(grupo.getPerfil().getNome());

        validarAcessos(teto, "fora do que o perfil " + grupo.getPerfil().getNome() + " pode receber", dados.telas(),
                dados.controles());
        sincronizarTelas(grupo, dados.telas(), teto);
        sincronizarControles(grupo, dados.controles(), teto);
        return detalhamento(grupo);
    }

    /** Cria um grupo do mesmo perfil com os mesmos acessos. Os membros não vão junto. */
    @Transactional
    public DetalhamentoGrupoUsuarioDto duplicar(Long id, DuplicacaoGrupoUsuarioDto dados) {
        var origem = buscar(id);
        var nome = dados.nome().trim();
        exigirNomeLivre(origem.getPerfil().getId(), nome, null);

        var copia = grupoRepository.save(new GrupoUsuario(origem.getPerfil(), nome, origem.getDescricao()));
        var teto = catalogoService.teto(origem.getPerfil().getNome());

        // Copia só o que ainda está no teto: o que saiu dele não vale mais nada.
        grupoTelaRepository.saveAll(grupoTelaRepository.findComTelaByGrupo(origem.getId()).stream()
                .filter(gt -> teto.telas().containsKey(gt.getTela().getCodigo()))
                .map(gt -> new GrupoUsuarioTela(copia, gt.getTela()))
                .toList());
        grupoControleRepository.saveAll(grupoControleRepository.findComControleByGrupo(origem.getId()).stream()
                .filter(gc -> teto.controles().containsKey(gc.getControle().getCodigo()))
                .map(gc -> new GrupoUsuarioControle(copia, gc.getControle()))
                .toList());

        return detalhamento(copia);
    }

    @Transactional
    public void excluir(Long id) {
        var grupo = buscar(id);
        if (ehPadrao(grupo)) {
            throw ErrosSistema.OperacaoInvalidaException.com("O grupo padrão não pode ser excluído.");
        }

        excluirComVinculos(grupo);
    }

    @Transactional(readOnly = true)
    public Page<MembroGrupoDto> buscarMembros(Long id, String busca, Pageable pageable) {
        var grupo = buscar(id);
        var pagina = membroRepository.buscarMembros(grupo.getId(), padraoDeBusca(busca), semOrdenacao(pageable));
        var individuais = contarIndividuais(grupo.getPerfil(),
                pagina.getContent().stream().map(PessoaGrupoDto::dadosPessoaisId).toList());
        return pagina.map(pessoa -> new MembroGrupoDto(pessoa,
                individuais.getOrDefault(pessoa.dadosPessoaisId(), 0L)));
    }

    @Transactional(readOnly = true)
    public Page<PessoaGrupoDto> buscarCandidatos(Long id, String busca, Pageable pageable) {
        var grupo = buscar(id);
        return membroRepository.buscarCandidatos(grupo.getId(), grupo.getPerfil().getId(), padraoDeBusca(busca),
                semOrdenacao(pageable));
    }

    /** Adiciona as pessoas ao grupo. Quem já é membro é ignorado. */
    @Transactional
    public void adicionarMembros(Long id, AdicaoMembrosDto dados) {
        var grupo = buscar(id);
        var ids = dados.dadosPessoaisIds();

        // RV6: só entra quem tem o perfil do grupo.
        var comPerfil = membroRepository.findComPerfilEntre(grupo.getPerfil().getId(), ids);
        if (comPerfil.size() < ids.size()) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Só podem entrar no grupo pessoas com o perfil " + grupo.getPerfil().getNome() + ".");
        }

        var jaMembros = membroRepository.findMembrosEntre(grupo.getId(), ids);
        membroRepository.saveAll(ids.stream()
                .filter(idPessoa -> !jaMembros.contains(idPessoa))
                .sorted()
                .map(idPessoa -> new GrupoUsuarioMembro(grupo, dadosPessoaisRepository.getReferenceById(idPessoa)))
                .toList());
    }

    @Transactional
    public void removerMembro(Long id, Long dadosPessoaisId) {
        var grupo = buscar(id);
        var membro = membroRepository.findByGrupoUsuarioIdAndDadosPessoaisId(grupo.getId(), dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Pessoa no grupo", dadosPessoaisId));
        membroRepository.delete(membro);
    }

    // ------------------------------------------------------------- acessos individuais

    @Transactional(readOnly = true)
    public AcessosIndividuaisDto acessosIndividuais(Long dadosPessoaisId, PerfilNome perfil) {
        perfilComGrupo(perfil);
        var pessoa = buscarPessoa(dadosPessoaisId);
        return acessosIndividuais(pessoa, perfil, grupoRepository.findIndividual(perfil, dadosPessoaisId).orElse(null));
    }

    /**
     * Substitui os acessos individuais da pessoa no perfil. Qualquer tela ou
     * controle ativo do catálogo serve, mesmo de fora do teto do perfil (D22),
     * inclusive os de dado sensível (D23). Tela do controle e dependências
     * valem como num grupo: o conjunto individual precisa funcionar sozinho,
     * mesmo que um grupo já conceda parte dele, para não quebrar se o grupo
     * mudar depois.
     */
    @Transactional
    public AcessosIndividuaisDto salvarAcessosIndividuais(Long dadosPessoaisId, PerfilNome perfil,
            AcessosGrupoUsuarioDto dados) {
        var perfilDoGrupo = perfilComGrupo(perfil);
        var pessoa = buscarPessoa(dadosPessoaisId);

        // RV6: só recebe acessos de um perfil quem tem o perfil.
        if (membroRepository.findComPerfilEntre(perfilDoGrupo.getId(), Set.of(dadosPessoaisId)).isEmpty()) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    pessoa.nome() + " não tem o perfil " + perfil + ", então não pode receber acessos dele.");
        }

        var catalogo = catalogoService.todos();
        validarAcessos(catalogo, "que não existem no catálogo", dados.telas(), dados.controles());

        var existente = grupoRepository.findIndividual(perfil, dadosPessoaisId);
        if (dados.telas().isEmpty() && dados.controles().isEmpty()) {
            // Sem nenhum acesso, o grupo individual deixa de existir.
            existente.ifPresent(this::excluirComVinculos);
            return acessosIndividuais(pessoa, perfil, null);
        }

        var grupo = existente.orElseGet(() -> criarIndividual(perfilDoGrupo, dadosPessoaisId));
        sincronizarTelas(grupo, dados.telas(), catalogo);
        sincronizarControles(grupo, dados.controles(), catalogo);
        return acessosIndividuais(pessoa, perfil, grupo);
    }

    private GrupoUsuario criarIndividual(Perfil perfil, Long dadosPessoaisId) {
        var pessoa = dadosPessoaisRepository.findById(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Pessoa", dadosPessoaisId));
        var grupo = grupoRepository.save(GrupoUsuario.individual(perfil, pessoa));
        // Como membro, a pessoa recebe o grupo pela mesma consulta dos outros (RP1).
        membroRepository.save(new GrupoUsuarioMembro(grupo, pessoa));
        return grupo;
    }

    private AcessosIndividuaisDto acessosIndividuais(PessoaGrupoDto pessoa, PerfilNome perfil, GrupoUsuario individual) {
        var idPessoa = pessoa.dadosPessoaisId();
        var grupos = membroRepository.findGruposNormais(idPessoa, perfil).stream()
                .map(grupo -> new GrupoDaPessoaDto(grupo.getId(), grupo.getNome(), Boolean.TRUE.equals(grupo.getAtivo())))
                .toList();

        var telas = individual == null ? List.<String>of()
                : grupoTelaRepository.findComTelaByGrupo(individual.getId()).stream()
                        .map(gt -> gt.getTela().getCodigo()).sorted().toList();
        var controles = individual == null ? List.<String>of()
                : grupoControleRepository.findComControleByGrupo(individual.getId()).stream()
                        .map(gc -> gc.getControle().getCodigo()).sorted().toList();

        return new AcessosIndividuaisDto(idPessoa, pessoa.nome(), pessoa.email(), perfil, grupos,
                herdados(idPessoa, perfil), telas, controles);
    }

    /** Código → grupos normais ativos da pessoa que o concedem no perfil. */
    private Map<String, List<String>> herdados(Long dadosPessoaisId, PerfilNome perfil) {
        Map<String, List<String>> herdados = new TreeMap<>();
        Stream.concat(membroRepository.findTelasDosGrupos(dadosPessoaisId, perfil).stream(),
                        membroRepository.findControlesDosGrupos(dadosPessoaisId, perfil).stream())
                .forEach(item -> herdados.computeIfAbsent(item.codigo(), codigo -> new ArrayList<>()).add(item.grupo()));
        return herdados;
    }

    /**
     * Pessoa → quantas telas e controles ela tem só pelo acesso individual no
     * perfil. O que um grupo ativo dela também dá não conta: o conjunto
     * individual guarda essas dependências para funcionar sozinho, mas para a
     * pessoa elas não são um acesso a mais. É a mesma conta da página dela.
     * Poucas pessoas têm acesso individual, então as consultas por pessoa saem
     * baratas.
     */
    private Map<Long, Long> contarIndividuais(Perfil perfil, Collection<Long> idsPessoas) {
        if (idsPessoas.isEmpty()) {
            return Map.of();
        }
        return grupoRepository.findIndividuaisEntre(perfil.getId(), idsPessoas).stream()
                .collect(Collectors.toMap(grupo -> grupo.getDadosPessoais().getId(), grupo -> {
                    var deGrupos = herdados(grupo.getDadosPessoais().getId(), perfil.getNome()).keySet();
                    return Stream.concat(
                                    grupoTelaRepository.findComTelaByGrupo(grupo.getId()).stream()
                                            .map(gt -> gt.getTela().getCodigo()),
                                    grupoControleRepository.findComControleByGrupo(grupo.getId()).stream()
                                            .map(gc -> gc.getControle().getCodigo()))
                            .filter(codigo -> !deGrupos.contains(codigo))
                            .count();
                }));
    }

    // ------------------------------------------------------------- validação

    /**
     * RV3 (dentro do limite: o teto, num grupo; o catálogo, no individual),
     * RV4 (controle com tela exige a tela) e RV5 (dependências). Junta todos os
     * problemas numa mensagem só, para a tela mostrar de uma vez.
     */
    private void validarAcessos(CatalogoPermissaoService.Teto teto, String foraDoLimite, Set<String> telas,
            Set<String> controles) {
        List<String> problemas = new ArrayList<>();

        var foraDoTeto = Stream.concat(
                        telas.stream().filter(codigo -> !teto.telas().containsKey(codigo)),
                        controles.stream().filter(codigo -> !teto.controles().containsKey(codigo)))
                .sorted()
                .toList();
        if (!foraDoTeto.isEmpty()) {
            problemas.add(foraDoLimite + ": " + String.join(", ", foraDoTeto));
        }

        controles.stream()
                .map(teto.controles()::get)
                .filter(Objects::nonNull)
                .filter(controle -> controle.getTela() != null && !telas.contains(controle.getTela().getCodigo()))
                .map(controle -> controle.getCodigo() + " precisa da tela " + controle.getTela().getCodigo())
                .sorted()
                .forEach(problemas::add);

        Set<String> concedidos = new HashSet<>(telas);
        concedidos.addAll(controles);
        concedidos.stream().sorted().forEach(codigo -> DependenciasPermissao.exigidos(codigo).stream()
                .filter(exigido -> !concedidos.contains(exigido))
                .sorted()
                .forEach(exigido -> problemas.add(codigo + " exige " + exigido)));

        if (!problemas.isEmpty()) {
            throw ErrosSistema.OperacaoInvalidaException.com("Acessos inválidos: " + String.join("; ", problemas) + ".");
        }
    }

    private void sincronizarTelas(GrupoUsuario grupo, Set<String> codigos, CatalogoPermissaoService.Teto teto) {
        var atuais = grupoTelaRepository.findComTelaByGrupo(grupo.getId());
        grupoTelaRepository.deleteAll(atuais.stream()
                .filter(gt -> !codigos.contains(gt.getTela().getCodigo()))
                .toList());

        var jaConcedidas = atuais.stream().map(gt -> gt.getTela().getCodigo()).collect(Collectors.toSet());
        grupoTelaRepository.saveAll(codigos.stream()
                .filter(codigo -> !jaConcedidas.contains(codigo))
                .sorted()
                .map(codigo -> new GrupoUsuarioTela(grupo, teto.telas().get(codigo)))
                .toList());
    }

    private void sincronizarControles(GrupoUsuario grupo, Set<String> codigos, CatalogoPermissaoService.Teto teto) {
        var atuais = grupoControleRepository.findComControleByGrupo(grupo.getId());
        grupoControleRepository.deleteAll(atuais.stream()
                .filter(gc -> !codigos.contains(gc.getControle().getCodigo()))
                .toList());

        var jaConcedidos = atuais.stream().map(gc -> gc.getControle().getCodigo()).collect(Collectors.toSet());
        grupoControleRepository.saveAll(codigos.stream()
                .filter(codigo -> !jaConcedidos.contains(codigo))
                .sorted()
                .map(codigo -> new GrupoUsuarioControle(grupo, teto.controles().get(codigo)))
                .toList());
    }

    // ------------------------------------------------------------- apoio

    private GrupoUsuario buscar(Long id) {
        return grupoRepository.findComPerfilById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Grupo de usuários", id));
    }

    private PessoaGrupoDto buscarPessoa(Long dadosPessoaisId) {
        return membroRepository.findPessoa(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Pessoa", dadosPessoaisId));
    }

    /** RV2: o ADMIN recebe o teto do perfil direto, sem grupo nem acesso individual. */
    private Perfil perfilComGrupo(PerfilNome nome) {
        if (nome == PerfilNome.ADMIN) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O perfil ADMIN não usa grupos: ele recebe direto tudo o que o perfil permite.");
        }
        var perfil = perfilRepository.findByNome(nome);
        if (perfil == null) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Perfil", nome);
        }
        return perfil;
    }

    /** RV8: vínculos primeiro, pelo JPA, para o Envers registrar cada remoção. */
    private void excluirComVinculos(GrupoUsuario grupo) {
        var id = grupo.getId();
        grupoTelaRepository.deleteAll(grupoTelaRepository.findComTelaByGrupo(id));
        grupoControleRepository.deleteAll(grupoControleRepository.findComControleByGrupo(id));
        membroRepository.deleteAll(membroRepository.findByGrupoUsuarioId(id));
        grupoRepository.delete(grupo);
    }

    /** RV1: nome único dentro do perfil. */
    private void exigirNomeLivre(Long perfilId, String nome, Long idAtual) {
        var emUso = idAtual == null
                ? grupoRepository.existsByPerfilIdAndNomeIgnoreCase(perfilId, nome)
                : grupoRepository.existsByPerfilIdAndNomeIgnoreCaseAndIdNot(perfilId, nome, idAtual);
        if (emUso) {
            throw new ErrosSistema.RecursoJaExisteException(
                    "Já existe um grupo chamado \"" + nome + "\" neste perfil.");
        }
    }

    private DetalhamentoGrupoUsuarioDto detalhamento(GrupoUsuario grupo) {
        var telas = grupoTelaRepository.findComTelaByGrupo(grupo.getId()).stream()
                .map(gt -> gt.getTela().getCodigo())
                .sorted()
                .toList();
        var controles = grupoControleRepository.findComControleByGrupo(grupo.getId()).stream()
                .map(gc -> gc.getControle().getCodigo())
                .sorted()
                .toList();

        return new DetalhamentoGrupoUsuarioDto(
                grupo.getId(),
                grupo.getNome(),
                grupo.getDescricao(),
                grupo.getPerfil().getNome(),
                ehPadrao(grupo),
                Boolean.TRUE.equals(grupo.getAtivo()),
                membroRepository.countByGrupoUsuarioId(grupo.getId()),
                telas,
                controles);
    }

    private static boolean ehPadrao(GrupoUsuario grupo) {
        return Boolean.TRUE.equals(grupo.getPadrao());
    }

    private static Map<Long, Long> porGrupo(List<ContagemPorGrupo> contagens) {
        return contagens.stream().collect(Collectors.toMap(ContagemPorGrupo::grupoId, ContagemPorGrupo::quantidade));
    }

    private static String limpar(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    private static String padraoDeBusca(String busca) {
        var termo = busca == null ? "" : busca.trim().toLowerCase(Locale.ROOT);
        return "%" + termo + "%";
    }

    /** A ordem vem da consulta (por nome); a página só define posição e tamanho. */
    private static Pageable semOrdenacao(Pageable pageable) {
        return PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), TAMANHO_MAXIMO_PAGINA));
    }
}
