package br.com.brain.usuario.gestao;

import br.com.brain.enums.PerfilNome;
import br.com.brain.permissao.AcessoDiretoDoPerfil;
import br.com.brain.permissao.CatalogoPermissaoService;
import br.com.brain.permissao.Controle;
import br.com.brain.permissao.ControlesDeGestao;
import br.com.brain.permissao.ControlesSensiveis;
import br.com.brain.permissao.GrupoUsuarioControleRepository;
import br.com.brain.permissao.GrupoUsuarioTelaRepository;
import br.com.brain.permissao.Tela;
import br.com.brain.permissao.VinculoDeGrupo;
import br.com.brain.permissao.dto.ModuloDto;
import br.com.brain.usuario.gestao.dto.AreaDiretaDto;
import br.com.brain.usuario.gestao.dto.ControleEfetivoDto;
import br.com.brain.usuario.gestao.dto.OrigemAcessoDto;
import br.com.brain.usuario.gestao.dto.TelaEfetivaDto;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

/**
 * O acesso efetivo de uma pessoa num perfil, item a item, com a origem de
 * cada um. As regras são as do PermissoesUsuarioService (RP1, D22, U14): só
 * grupo ativo conta; o grupo normal vale dentro do teto do perfil; o
 * individual vale fora do teto, menos para os itens de gestão; o ADMIN recebe
 * o teto sem grupo. O teste de integração confere que as duas contas batem.
 *
 * A conta é feita a partir dos grupos informados, e não dos que a pessoa tem
 * agora, para a prévia de conceder perfil mostrar o que o grupo padrão traria.
 */
@Component
@RequiredArgsConstructor
class AcessoEfetivoCalculo {

    private final CatalogoPermissaoService catalogoService;
    private final GrupoUsuarioTelaRepository grupoTelaRepository;
    private final GrupoUsuarioControleRepository grupoControleRepository;

    record Itens(List<TelaEfetivaDto> telas, List<ControleEfetivoDto> controles) {
    }

    /** O que os grupos ativos entre os informados concedem no perfil. */
    Itens dosGrupos(PerfilNome perfil, List<VinculoDeGrupo> grupos) {
        var teto = catalogoService.teto(perfil);
        var telas = new Acumulador<Tela>();
        var controles = new Acumulador<Controle>();

        for (var grupo : grupos) {
            if (!Boolean.TRUE.equals(grupo.ativo()) || grupo.perfil() != perfil) {
                continue;
            }
            var origem = grupo.individual() ? OrigemAcessoDto.INDIVIDUAL : OrigemAcessoDto.grupo(grupo.nome());
            for (var gt : grupoTelaRepository.findComTelaByGrupo(grupo.grupoId())) {
                var tela = gt.getTela();
                if (vale(tela.getAtivo(), tela.getCodigo(), teto.telas().containsKey(tela.getCodigo()),
                        grupo.individual())) {
                    telas.somar(tela.getCodigo(), tela, origem);
                }
            }
            for (var gc : grupoControleRepository.findComControleByGrupo(grupo.grupoId())) {
                var controle = gc.getControle();
                if (vale(controle.getAtivo(), controle.getCodigo(),
                        teto.controles().containsKey(controle.getCodigo()), grupo.individual())) {
                    controles.somar(controle.getCodigo(), controle, origem);
                }
            }
        }
        return new Itens(telas(telas), controles(controles));
    }

    /** O ADMIN não tem grupo: recebe o teto do perfil inteiro (RP4). */
    Itens tetoDoAdmin() {
        var teto = catalogoService.teto(PerfilNome.ADMIN);
        var telas = new Acumulador<Tela>();
        var controles = new Acumulador<Controle>();
        teto.telas().forEach((codigo, tela) -> telas.somar(codigo, tela, OrigemAcessoDto.TETO_ADMIN));
        teto.controles().forEach((codigo, controle) -> controles.somar(codigo, controle, OrigemAcessoDto.TETO_ADMIN));
        return new Itens(telas(telas), controles(controles));
    }

    static List<AreaDiretaDto> servidor(PerfilNome perfil) {
        return AcessoDiretoDoPerfil.de(perfil).stream().map(AreaDiretaDto::de).toList();
    }

    private static boolean vale(Boolean ativo, String codigo, boolean noTeto, boolean individual) {
        if (!Boolean.TRUE.equals(ativo)) {
            return false;
        }
        return noTeto || (individual && !ControlesDeGestao.contem(codigo));
    }

    private static List<TelaEfetivaDto> telas(Acumulador<Tela> acumulador) {
        return acumulador.itens.values().stream()
                .map(item -> {
                    var modulo = ModuloDto.de(item.valor.getModulo());
                    return new TelaEfetivaDto(item.valor.getCodigo(), item.valor.getNome(), item.valor.getRota(),
                            modulo == null ? null : modulo.nome(), item.origens);
                })
                .sorted(Comparator.comparing((TelaEfetivaDto t) -> Objects.toString(t.modulo(), "~"))
                        .thenComparing(TelaEfetivaDto::nome))
                .toList();
    }

    private static List<ControleEfetivoDto> controles(Acumulador<Controle> acumulador) {
        return acumulador.itens.values().stream()
                .map(item -> new ControleEfetivoDto(item.valor.getCodigo(), item.valor.getNome(),
                        item.valor.getTela() == null ? null : item.valor.getTela().getNome(),
                        ControlesSensiveis.contem(item.valor.getCodigo()), item.origens))
                .sorted(Comparator.comparing((ControleEfetivoDto c) -> Objects.toString(c.tela(), "~"))
                        .thenComparing(ControleEfetivoDto::nome))
                .toList();
    }

    /** Junta as origens de um mesmo item, sem repetir. */
    private static final class Acumulador<T> {

        private record Item<T>(T valor, List<OrigemAcessoDto> origens) {
        }

        private final Map<String, Item<T>> itens = new LinkedHashMap<>();

        void somar(String codigo, T valor, OrigemAcessoDto origem) {
            var item = itens.computeIfAbsent(codigo, c -> new Item<>(valor, new ArrayList<>()));
            if (!item.origens().contains(origem)) {
                item.origens().add(origem);
            }
        }
    }
}
