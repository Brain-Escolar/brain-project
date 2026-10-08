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

/** O teto de cada perfil: o que um grupo daquele perfil pode receber. */
@Service
@RequiredArgsConstructor
public class CatalogoPermissaoService {

    private final TelaRepository telaRepository;
    private final ControleRepository controleRepository;

    /** Teto indexado por código, para validar os acessos de um grupo. */
    public record Teto(Map<String, Tela> telas, Map<String, Controle> controles) {
    }

    @Transactional(readOnly = true)
    public Teto teto(PerfilNome perfil) {
        return new Teto(
                indexar(telaRepository.findNoTetoDoPerfil(perfil), Tela::getCodigo),
                indexar(controleRepository.findNoTetoDoPerfil(perfil), Controle::getCodigo));
    }

    @Transactional(readOnly = true)
    public CatalogoPermissaoDto catalogo(PerfilNome perfil) {
        var teto = teto(perfil);

        Map<String, List<ControleCatalogoDto>> controlesPorTela = teto.controles().values().stream()
                .filter(c -> c.getTela() != null)
                .collect(Collectors.groupingBy(c -> c.getTela().getCodigo(), LinkedHashMap::new,
                        Collectors.mapping(this::paraDto, Collectors.toList())));

        var telas = teto.telas().values().stream()
                .map(t -> new TelaCatalogoDto(t.getCodigo(), t.getNome(), t.getRota(),
                        Boolean.TRUE.equals(t.getExibirMenu()),
                        controlesPorTela.getOrDefault(t.getCodigo(), List.of())))
                .toList();

        var controlesGerais = teto.controles().values().stream()
                .filter(c -> c.getTela() == null)
                .map(this::paraDto)
                .toList();

        // Só as dependências de itens que o perfil pode receber: as outras não
        // interessam a quem monta um grupo deste perfil.
        var codigos = new HashSet<>(teto.telas().keySet());
        codigos.addAll(teto.controles().keySet());
        Map<String, List<String>> dependencias = new TreeMap<>();
        DependenciasPermissao.todas().forEach((item, exigidos) -> {
            if (codigos.contains(item)) {
                dependencias.put(item, exigidos.stream().sorted().toList());
            }
        });

        return new CatalogoPermissaoDto(perfil, telas, controlesGerais, dependencias);
    }

    private ControleCatalogoDto paraDto(Controle controle) {
        return new ControleCatalogoDto(controle.getCodigo(), controle.getNome(), controle.getDescricao());
    }

    /** Mantém a ordem das consultas (por nome). */
    private static <T> Map<String, T> indexar(List<T> itens, Function<T, String> codigo) {
        return itens.stream().collect(Collectors.toMap(codigo, Function.identity(), (a, b) -> a, LinkedHashMap::new));
    }
}
