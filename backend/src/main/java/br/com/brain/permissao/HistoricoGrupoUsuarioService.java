package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.permissao.HistoricoGrupoUsuarioRepository.EstadoGrupo;
import br.com.brain.permissao.HistoricoGrupoUsuarioRepository.Revisao;
import br.com.brain.permissao.HistoricoGrupoUsuarioRepository.Vinculo;
import br.com.brain.permissao.dto.RevisaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.RevisaoGrupoUsuarioDto.CampoAlteradoDto;
import br.com.brain.permissao.dto.RevisaoGrupoUsuarioDto.ItemDto;
import br.com.brain.permissao.dto.RevisaoGrupoUsuarioDto.PessoaDto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Histórico de um grupo normal: nome, descrição, situação, telas, controles e
 * pessoas, por revisão do Envers, da mais recente para a mais antiga.
 *
 * Grupo excluído e grupo individual respondem 404, como no detalhe. O que veio
 * do seed da V111 não tem revisão: o histórico começa na primeira alteração
 * feita pela tela.
 */
@Service
@RequiredArgsConstructor
public class HistoricoGrupoUsuarioService {

    static final String VER_HISTORICO = "GRUPO_USUARIO.HISTORICO.VER";

    private static final int TAMANHO_MAXIMO_PAGINA = 100;

    private final GrupoUsuarioRepository grupoRepository;
    private final HistoricoGrupoUsuarioRepository historicoRepository;
    private final PermissoesUsuarioService permissoesService;

    @Transactional(readOnly = true)
    public Page<RevisaoGrupoUsuarioDto> historico(Long id, DadosAutenticacao usuario, Pageable pageable) {
        if (usuario == null || !permissoesService.temControle(usuario, VER_HISTORICO)) {
            throw new ErrosSistema.AcessoNegadoException("Você não tem permissão para ver o histórico dos grupos.");
        }
        grupoRepository.findComPerfilById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Grupo de usuários", id));

        var pagina = PageRequest.of(pageable.getPageNumber(), Math.min(pageable.getPageSize(), TAMANHO_MAXIMO_PAGINA));
        var total = historicoRepository.contarRevisoes(id);
        List<Revisao> revisoes = total == 0 ? List.of()
                : historicoRepository.buscarRevisoes(id, pagina.getPageSize(), pagina.getOffset());
        if (revisoes.isEmpty()) {
            return new PageImpl<>(List.of(), pagina, total);
        }

        var revs = revisoes.stream().map(Revisao::rev).toList();
        var criacoes = new HashSet<Long>();
        var campos = camposPorRevisao(historicoRepository.buscarEstados(id), criacoes);
        var telas = porRevisao(historicoRepository.buscarTelas(id, revs));
        var controles = porRevisao(historicoRepository.buscarControles(id, revs));
        var membros = porRevisao(historicoRepository.buscarMembros(id, revs));

        var conteudo = revisoes.stream()
                .map(revisao -> {
                    var rev = revisao.rev();
                    var telasDaRevisao = telas.getOrDefault(rev, List.of());
                    var controlesDaRevisao = controles.getOrDefault(rev, List.of());
                    var membrosDaRevisao = membros.getOrDefault(rev, List.of());
                    return new RevisaoGrupoUsuarioDto(
                            rev,
                            revisao.data(),
                            revisao.autorId() == null ? null : new PessoaDto(revisao.autorId(), revisao.autorNome()),
                            criacoes.contains(rev),
                            campos.getOrDefault(rev, List.of()),
                            filtrar(telasDaRevisao, HistoricoGrupoUsuarioRepository.CRIADO, HistoricoGrupoUsuarioService::item),
                            filtrar(telasDaRevisao, HistoricoGrupoUsuarioRepository.REMOVIDO, HistoricoGrupoUsuarioService::item),
                            filtrar(controlesDaRevisao, HistoricoGrupoUsuarioRepository.CRIADO, HistoricoGrupoUsuarioService::item),
                            filtrar(controlesDaRevisao, HistoricoGrupoUsuarioRepository.REMOVIDO, HistoricoGrupoUsuarioService::item),
                            filtrar(membrosDaRevisao, HistoricoGrupoUsuarioRepository.CRIADO, HistoricoGrupoUsuarioService::pessoa),
                            filtrar(membrosDaRevisao, HistoricoGrupoUsuarioRepository.REMOVIDO, HistoricoGrupoUsuarioService::pessoa));
                })
                .toList();
        return new PageImpl<>(conteudo, pagina, total);
    }

    /**
     * O que cada revisão mudou em nome, descrição e situação, comparando com a
     * versão anterior. Na criação, os valores iniciais (antes nulo).
     */
    private static Map<Long, List<CampoAlteradoDto>> camposPorRevisao(List<EstadoGrupo> estados, Set<Long> criacoes) {
        Map<Long, List<CampoAlteradoDto>> resultado = new HashMap<>();
        EstadoGrupo anterior = null;
        for (var estado : estados) {
            if (estado.tipo() == HistoricoGrupoUsuarioRepository.REMOVIDO) {
                continue;
            }
            if (estado.tipo() == HistoricoGrupoUsuarioRepository.CRIADO) {
                criacoes.add(estado.rev());
                anterior = null;
            }
            var campos = new ArrayList<CampoAlteradoDto>();
            comparar(campos, "nome", anterior == null ? null : anterior.nome(), estado.nome());
            comparar(campos, "descricao", anterior == null ? null : anterior.descricao(), estado.descricao());
            // Grupo nasce ativo: só vale registrar a situação quando ela muda.
            if (anterior != null) {
                comparar(campos, "ativo", texto(anterior.ativo()), texto(estado.ativo()));
            }
            if (!campos.isEmpty()) {
                resultado.put(estado.rev(), campos);
            }
            anterior = estado;
        }
        return resultado;
    }

    private static void comparar(List<CampoAlteradoDto> campos, String campo, String antes, String depois) {
        if (!Objects.equals(antes, depois)) {
            campos.add(new CampoAlteradoDto(campo, antes, depois));
        }
    }

    private static String texto(Boolean valor) {
        return valor == null ? null : valor.toString();
    }

    private static Map<Long, List<Vinculo>> porRevisao(List<Vinculo> vinculos) {
        return vinculos.stream().collect(Collectors.groupingBy(Vinculo::rev));
    }

    private static <T> List<T> filtrar(List<Vinculo> vinculos, int tipo, Function<Vinculo, T> conversor) {
        return vinculos.stream().filter(v -> v.tipo() == tipo).map(conversor).toList();
    }

    private static ItemDto item(Vinculo vinculo) {
        return new ItemDto(vinculo.chave(), vinculo.nome());
    }

    private static PessoaDto pessoa(Vinculo vinculo) {
        return new PessoaDto(Long.valueOf(vinculo.chave()), vinculo.nome());
    }
}
