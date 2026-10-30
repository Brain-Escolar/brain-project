package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.Perfil;
import br.com.brain.permissao.dto.PermissoesPerfilDto;
import br.com.brain.permissao.dto.PermissoesUsuarioDto;

import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Permissões efetivas de quem está logado (docs/permissoes.md, seção 5).
 *
 * - ADMIN: o teto inteiro do perfil, sem grupo (RP4).
 * - Demais perfis: o que os grupos ativos da pessoa concedem, dentro do teto (RP1),
 *   mais o acesso individual, que não tem teto (D22). Perfil sem grupo nenhum
 *   vem com as listas vazias.
 *
 * Só perfis que a pessoa tem agora entram na resposta: grupo de um perfil que
 * ela perdeu não concede nada, sem precisar limpar o vínculo.
 */
@Service
@RequiredArgsConstructor
public class PermissoesUsuarioService {

    private final GrupoUsuarioMembroRepository membroRepository;
    private final CatalogoPermissaoService catalogoService;

    @Transactional(readOnly = true)
    public PermissoesUsuarioDto doUsuario(DadosAutenticacao usuario) {
        var pessoa = usuario.getDadosPessoais();
        Set<PerfilNome> perfis = pessoa == null ? Set.of()
                : pessoa.getPerfis().stream()
                        .map(Perfil::getNome)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toCollection(() -> EnumSet.noneOf(PerfilNome.class)));

        Map<PerfilNome, List<String>> telas = Map.of();
        Map<PerfilNome, List<String>> controles = Map.of();
        if (pessoa != null && perfis.stream().anyMatch(perfil -> perfil != PerfilNome.ADMIN)) {
            telas = porPerfil(membroRepository.findTelasEfetivas(pessoa.getId()));
            controles = porPerfil(membroRepository.findControlesEfetivos(pessoa.getId()));
        }

        Map<PerfilNome, PermissoesPerfilDto> resposta = new LinkedHashMap<>();
        for (var perfil : perfis) {
            if (perfil == PerfilNome.ADMIN) {
                var teto = catalogoService.teto(PerfilNome.ADMIN);
                resposta.put(perfil, new PermissoesPerfilDto(
                        teto.telas().keySet().stream().sorted().toList(),
                        teto.controles().keySet().stream().sorted().toList()));
            } else {
                resposta.put(perfil, new PermissoesPerfilDto(
                        telas.getOrDefault(perfil, List.of()),
                        controles.getOrDefault(perfil, List.of())));
            }
        }

        var gerencia = perfis.contains(PerfilNome.ADMIN) || perfis.contains(PerfilNome.DIRETOR);
        return new PermissoesUsuarioDto(gerencia, resposta);
    }

    /**
     * Se a pessoa tem alguma das telas liberada, em qualquer perfil dela (como a
     * guarda de tela do frontend). Usado pelas regras de URL "perfil ou tela".
     */
    @Transactional(readOnly = true)
    public boolean temAlgumaTela(DadosAutenticacao usuario, Set<String> telas) {
        return doUsuario(usuario).perfis().values().stream()
                .anyMatch(perfil -> perfil.telas().stream().anyMatch(telas::contains));
    }

    /** Se a pessoa tem o controle, em qualquer perfil dela. */
    @Transactional(readOnly = true)
    public boolean temControle(DadosAutenticacao usuario, String codigo) {
        return doUsuario(usuario).perfis().values().stream()
                .anyMatch(perfil -> perfil.controles().contains(codigo));
    }

    private static Map<PerfilNome, List<String>> porPerfil(List<ItemPorPerfil> itens) {
        return itens.stream().collect(Collectors.groupingBy(
                ItemPorPerfil::perfil,
                Collectors.mapping(ItemPorPerfil::codigo,
                        Collectors.collectingAndThen(Collectors.toList(),
                                codigos -> codigos.stream().sorted().toList()))));
    }
}
