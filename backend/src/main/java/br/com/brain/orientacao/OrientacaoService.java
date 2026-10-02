package br.com.brain.orientacao;

import br.com.brain.aluno.AlunoRepository;
import br.com.brain.aluno.dto.ListagemAlunoDto;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.comunicado.ComunicadoRepository;
import br.com.brain.comunicado.ComunicadoService;
import br.com.brain.conversa.ConversaRepository;
import br.com.brain.conversa.ConversaService;
import br.com.brain.enums.PerfilNome;
import br.com.brain.enums.StatusConversa;
import br.com.brain.mensagem.MensagemRepository;
import br.com.brain.orientacao.dto.IndicadoresOrientacaoDto;
import br.com.brain.orientacao.dto.InicioOrientacaoDto;
import br.com.brain.turma.TurmaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Monta a tela inicial da Orientação a partir dos domínios que já existem —
 * alunos, turmas, conversas do "Fale conosco" e comunicados. Não há vínculo
 * orientador↔aluno no domínio: a Orientação enxerga a escola (tenant) inteira e
 * recorta o que precisa pelos filtros da busca de alunos.
 */
@Service
@RequiredArgsConstructor
public class OrientacaoService {

    /** Quantos atendimentos aparecem no resumo da tela inicial. */
    private static final int ATENDIMENTOS_NO_INICIO = 5;
    /** Quantos comunicados aparecem no resumo da tela inicial. */
    private static final int COMUNICADOS_NO_INICIO = 4;
    /** Janela usada no indicador "comunicados recentes". */
    private static final int DIAS_COMUNICADOS_RECENTES = 30;

    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;
    private final ConversaRepository conversaRepository;
    private final ComunicadoRepository comunicadoRepository;
    private final MensagemRepository mensagemRepository;
    private final ConversaService conversaService;
    private final ComunicadoService comunicadoService;

    @Transactional(readOnly = true)
    public InicioOrientacaoDto montarInicio(DadosAutenticacao usuario) {
        var dadosPessoaisId = usuario.getDadosPessoais().getId();

        // listarPorDestinatario valida que o usuário realmente tem o perfil ORIENTADOR.
        var atendimentos = conversaService.listarPorDestinatario(
                dadosPessoaisId,
                PerfilNome.ORIENTADOR,
                PageRequest.of(0, ATENDIMENTOS_NO_INICIO, Sort.by(Sort.Direction.DESC, "criadoEm")))
                .getContent();

        var comunicados = comunicadoService.listar(
                PageRequest.of(0, COMUNICADOS_NO_INICIO, Sort.by(Sort.Direction.DESC, "data")), usuario)
                .getContent();

        return new InicioOrientacaoDto(montarIndicadores(dadosPessoaisId), atendimentos, comunicados);
    }

    @Transactional(readOnly = true)
    public Page<ListagemAlunoDto> buscarAlunos(String termo, Long unidadeId, Long serieId, Long turmaId,
            Pageable paginacao) {
        var termoBusca = (termo == null || termo.isBlank()) ? null : termo.trim();
        return alunoRepository
                .buscarMatriculadosParaOrientacao(termoBusca, unidadeId, serieId, turmaId, paginacao)
                .map(ListagemAlunoDto::new);
    }

    private IndicadoresOrientacaoDto montarIndicadores(Long dadosPessoaisId) {
        var hoje = LocalDate.now();
        return new IndicadoresOrientacaoDto(
                alunoRepository.countByMatriculadoTrue(),
                alunoRepository.countByMatriculadoTrueAndTurmaIsNull(),
                turmaRepository.count(),
                conversaRepository.countByDestinatarioNomeAndStatus(PerfilNome.ORIENTADOR, StatusConversa.ABERTA),
                mensagemRepository.countConversasNaoLidasPorDestinatario(PerfilNome.ORIENTADOR, dadosPessoaisId),
                comunicadoRepository.countByDataBetween(hoje.minusDays(DIAS_COMUNICADOS_RECENTES), hoje));
    }
}
