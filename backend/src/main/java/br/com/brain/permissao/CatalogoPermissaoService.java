package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;
import br.com.brain.permissao.dto.CatalogoPermissaoDto;
import br.com.brain.permissao.dto.ControleCatalogoDto;
import br.com.brain.permissao.dto.TelaCatalogoDto;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * O que pode ser concedido: o teto de cada perfil, para os grupos, e o catálogo
 * inteiro, para o acesso individual (D22).
 */
@Service
@RequiredArgsConstructor
public class CatalogoPermissaoService {

    private final TelaRepository telaRepository;
    private final ControleRepository controleRepository;

    /** Telas e controles indexados por código, para validar e gravar acessos. */
    public record Teto(Map<String, Tela> telas, Map<String, Controle> controles) {
    }

    @Transactional(readOnly = true)
    public Teto teto(PerfilNome perfil) {
        return new Teto(
                indexar(telaRepository.findNoTetoDoPerfil(perfil), Tela::getCodigo),
                indexar(controleRepository.findNoTetoDoPerfil(perfil), Controle::getCodigo));
    }

    /** Tudo o que está ativo no catálogo, de todos os perfis: o limite do acesso individual. */
    @Transactional(readOnly = true)
    public Teto todos() {
        return new Teto(
                indexar(telaRepository.findAtivas(), Tela::getCodigo),
                indexar(controleRepository.findAtivos(), Controle::getCodigo));
    }

    /** O que um grupo do perfil pode receber: o teto. */
    @Transactional(readOnly = true)
    public CatalogoPermissaoDto catalogo(PerfilNome perfil) {
        var teto = teto(perfil);
        return montar(perfil, teto, teto);
    }

    /**
     * O que o acesso individual de uma pessoa no perfil pode receber: o catálogo
     * inteiro, com o que é de fora do teto marcado (doPerfil falso).
     */
    @Transactional(readOnly = true)
    public CatalogoPermissaoDto catalogoIndividual(PerfilNome perfil) {
        return montar(perfil, todos(), teto(perfil));
    }

    private CatalogoPermissaoDto montar(PerfilNome perfil, Teto itens, Teto tetoDoPerfil) {
        Map<String, List<ControleCatalogoDto>> controlesPorTela = itens.controles().values().stream()
                .filter(c -> c.getTela() != null)
                .collect(Collectors.groupingBy(c -> c.getTela().getCodigo(), LinkedHashMap::new,
                        Collectors.mapping(c -> paraDto(c, tetoDoPerfil), Collectors.toList())));

        var telas = itens.telas().values().stream()
                .map(t -> new TelaCatalogoDto(t.getCodigo(), t.getNome(), t.getRota(),
                        Boolean.TRUE.equals(t.getExibirMenu()),
                        tetoDoPerfil.telas().containsKey(t.getCodigo()),
                        controlesPorTela.getOrDefault(t.getCodigo(), List.of())))
                .toList();

        var controlesGerais = itens.controles().values().stream()
                .filter(c -> c.getTela() == null)
                .map(c -> paraDto(c, tetoDoPerfil))
                .toList();

        // Só as dependências de itens que podem ser concedidos aqui: as outras
        // não interessam a quem está montando estes acessos.
        var codigos = new HashSet<>(itens.telas().keySet());
        codigos.addAll(itens.controles().keySet());
        Map<String, List<String>> dependencias = new TreeMap<>();
        DependenciasPermissao.todas().forEach((item, exigidos) -> {
            if (codigos.contains(item)) {
                dependencias.put(item, exigidos.stream().sorted().toList());
            }
        });

        return new CatalogoPermissaoDto(perfil, telas, controlesGerais, dependencias);
    }

    private static ControleCatalogoDto paraDto(Controle controle, Teto tetoDoPerfil) {
        return new ControleCatalogoDto(controle.getCodigo(), controle.getNome(), controle.getDescricao(),
                tetoDoPerfil.controles().containsKey(controle.getCodigo()),
                ControlesSensiveis.contem(controle.getCodigo()));
    }

    /** Mantém a ordem das consultas (por nome). */
    private static <T> Map<String, T> indexar(List<T> itens, Function<T, String> codigo) {
        return itens.stream().collect(Collectors.toMap(codigo, Function.identity(), (a, b) -> a, LinkedHashMap::new));
    }
}
