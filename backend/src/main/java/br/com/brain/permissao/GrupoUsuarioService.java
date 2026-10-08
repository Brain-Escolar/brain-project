package br.com.brain.permissao;

import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;
import br.com.brain.permissao.dto.AdicaoMembrosDto;
import br.com.brain.permissao.dto.AtualizacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.permissao.dto.DetalhamentoGrupoUsuarioDto;
import br.com.brain.permissao.dto.DuplicacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.ListagemGrupoUsuarioDto;
import br.com.brain.permissao.dto.PessoaGrupoDto;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Grupos de acesso: criação, acessos e membros (docs/permissoes.md).
 *
 * Só cuida da configuração. Quem decide o acesso no sistema ainda é o perfil;
 * nada aqui é consultado fora da tela de grupos até a fase F2/F3 da spec.
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

    @Transactional
    public DetalhamentoGrupoUsuarioDto cadastrar(CadastroGrupoUsuarioDto dados) {
        // RV2: o ADMIN recebe o teto do perfil direto, sem grupo.
        if (dados.perfil() == PerfilNome.ADMIN) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O perfil ADMIN não usa grupos: ele recebe direto tudo o que o perfil permite.");
        }
        var perfil = perfilRepository.findByNome(dados.perfil());
        if (perfil == null) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Perfil", dados.perfil());
        }

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

        validarAcessos(grupo.getPerfil().getNome(), teto, dados.telas(), dados.controles());
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

        // RV8: vínculos primeiro, pelo JPA, para o Envers registrar cada remoção.
        grupoTelaRepository.deleteAll(grupoTelaRepository.findComTelaByGrupo(id));
        grupoControleRepository.deleteAll(grupoControleRepository.findComControleByGrupo(id));
        membroRepository.deleteAll(membroRepository.findByGrupoUsuarioId(id));
        grupoRepository.delete(grupo);
    }

    @Transactional(readOnly = true)
    public Page<PessoaGrupoDto> buscarMembros(Long id, String busca, Pageable pageable) {
        var grupo = buscar(id);
        return membroRepository.buscarMembros(grupo.getId(), padraoDeBusca(busca), semOrdenacao(pageable));
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

    // ------------------------------------------------------------- validação

    /**
     * RV3 (teto), RV4 (controle com tela exige a tela) e RV5 (dependências).
     * Junta todos os problemas numa mensagem só, para a tela mostrar de uma vez.
     */
    private void validarAcessos(PerfilNome perfil, CatalogoPermissaoService.Teto teto, Set<String> telas,
            Set<String> controles) {
        List<String> problemas = new ArrayList<>();

        var foraDoTeto = Stream.concat(
                        telas.stream().filter(codigo -> !teto.telas().containsKey(codigo)),
                        controles.stream().filter(codigo -> !teto.controles().containsKey(codigo)))
                .sorted()
                .toList();
        if (!foraDoTeto.isEmpty()) {
            problemas.add("fora do que o perfil " + perfil + " pode receber: " + String.join(", ", foraDoTeto));
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
