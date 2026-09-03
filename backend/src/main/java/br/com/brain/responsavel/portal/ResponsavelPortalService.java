package br.com.brain.responsavel.portal;

import br.com.brain.aluno.AlunoService;
import br.com.brain.aluno.dto.DetalhamentoAlunoDto;
import br.com.brain.anotacao.AnotacaoService;
import br.com.brain.anotacao.dto.AnotacaoAlunoDisciplinaDto;
import br.com.brain.anotacao.dto.ListagemAnotacaoSemanaDto;
import br.com.brain.aula.dto.ListagemAulaDto;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.evento.EventoService;
import br.com.brain.evento.dto.ListagemEventoDto;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.fichamedica.FichaMedicaService;
import br.com.brain.fichamedica.dto.DetalhamentoFichaMedicaDto;
import br.com.brain.materialComplementar.MaterialComplementarService;
import br.com.brain.materialComplementar.dto.ListagemMaterialComplementarDto;
import br.com.brain.notas.NotasService;
import br.com.brain.notas.dto.DetalhamentoNotasAlunoDisciplinaDto;
import br.com.brain.produto.AlunoProdutoService;
import br.com.brain.produto.dto.ListagemAlunoProdutoDto;
import br.com.brain.relatorios.RelatoriosService;
import br.com.brain.relatorios.dto.RelatorioDto;
import br.com.brain.responsavel.portal.dto.AlunoVinculadoDto;
import br.com.brain.responsavel.portal.dto.ResponsavelLogadoDto;
import br.com.brain.responsavel.portal.dto.ResumoAlunoDto;
import br.com.brain.tarefa.TarefaService;
import br.com.brain.tarefa.dto.ListagemTarefaAlunoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Facade de leitura do Portal do Responsavel.
 *
 * Nao contem regra de negocio propria: delega aos services que ja servem o
 * aluno e a secretaria. O que ele adiciona e a fronteira de autorizacao -
 * todo metodo publico que recebe alunoId comeca pelo guard.
 *
 * A classe inteira e transacional de leitura de proposito: o guard carrega o
 * aluno com join fetch e os services delegados navegam associacoes LAZY a
 * partir dele. Sem a transacao compartilhada isso quebraria com
 * LazyInitializationException.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResponsavelPortalService {

    private static final int TAREFAS_NA_HOME = 5;

    private final VinculoResponsavelGuard guard;

    private final AlunoService alunoService;
    private final RelatoriosService relatoriosService;
    private final NotasService notasService;
    private final AnotacaoService anotacaoService;
    private final TarefaService tarefaService;
    private final MaterialComplementarService materialComplementarService;
    private final FichaMedicaService fichaMedicaService;
    private final AlunoProdutoService alunoProdutoService;
    private final EventoService eventoService;

    // ---------------------------------------------------------------- sessao

    public ResponsavelLogadoDto meusDados(DadosAutenticacao usuario) {
        return new ResponsavelLogadoDto(guard.resolverResponsavel(usuario));
    }

    public List<AlunoVinculadoDto> alunosVinculados(DadosAutenticacao usuario) {
        return guard.resolverResponsavel(usuario).getAlunos().stream()
                .map(AlunoVinculadoDto::new)
                .toList();
    }

    // ------------------------------------------------------------------ home

    public ResumoAlunoDto resumo(DadosAutenticacao usuario, Long alunoId) {
        var aluno = guard.assertPodeVer(usuario, alunoId);
        var tarefas = tarefaService
                .recuperarTarefasAluno(turmaDe(aluno), PageRequest.of(0, TAREFAS_NA_HOME, Sort.by("prazo")))
                .getContent();
        return new ResumoAlunoDto(
                new AlunoVinculadoDto(aluno),
                relatoriosService.gerarRelatorio(aluno),
                tarefas,
                anotacaoService.recuperarAnotacoesSemana(aluno.getId()));
    }

    // ------------------------------------------------------------ pedagogico

    public DetalhamentoAlunoDto perfil(DadosAutenticacao usuario, Long alunoId) {
        guard.assertPodeVer(usuario, alunoId);
        return new DetalhamentoAlunoDto(alunoService.detalhar(alunoId));
    }

    /** Relatorio completo: notas, frequencia, periodos e situacao. Mesma fonte da visao do aluno. */
    public RelatorioDto relatorio(DadosAutenticacao usuario, Long alunoId) {
        return relatoriosService.gerarRelatorio(guard.assertPodeVer(usuario, alunoId));
    }

    public DetalhamentoNotasAlunoDisciplinaDto notasPorDisciplina(
            DadosAutenticacao usuario, Long alunoId, Long disciplinaId) {
        guard.assertPodeVer(usuario, alunoId);
        return notasService.buscarNotasAlunoPorDisciplina(alunoId, disciplinaId);
    }

    public List<ListagemAnotacaoSemanaDto> ocorrenciasDaSemana(DadosAutenticacao usuario, Long alunoId) {
        var aluno = guard.assertPodeVer(usuario, alunoId);
        return anotacaoService.recuperarAnotacoesSemana(aluno.getId());
    }

    public List<AnotacaoAlunoDisciplinaDto> ocorrenciasPorDisciplina(
            DadosAutenticacao usuario, Long alunoId, Long disciplinaId) {
        guard.assertPodeVer(usuario, alunoId);
        return anotacaoService.buscarPorAlunoEDisciplina(alunoId, disciplinaId);
    }

    public List<ListagemAulaDto> gradeHoraria(DadosAutenticacao usuario, Long alunoId) {
        var aluno = guard.assertPodeVer(usuario, alunoId);
        if (aluno.getDadosPessoais() == null || aluno.getDadosPessoais().getMatricula() == null) {
            throw new OperacaoInvalidaException("Aluno sem matricula: nao e possivel montar a grade horaria.");
        }
        return alunoService.gerarGradeHoraria(aluno.getDadosPessoais().getMatricula());
    }

    public Page<ListagemTarefaAlunoDto> tarefas(DadosAutenticacao usuario, Long alunoId, Pageable paginacao) {
        var aluno = guard.assertPodeVer(usuario, alunoId);
        return tarefaService.recuperarTarefasAluno(turmaDe(aluno), paginacao);
    }

    public List<ListagemMaterialComplementarDto> materiais(DadosAutenticacao usuario, Long alunoId) {
        var aluno = guard.assertPodeVer(usuario, alunoId);
        return materialComplementarService.listarPorAluno(turmaDe(aluno));
    }

    /**
     * Calendario do aluno: eventos escopados pela turma/serie/unidade dele.
     * O endpoint generico /evento ja aceita esses filtros - aqui apenas
     * garantimos que o responsavel nao consiga ampliar o escopo.
     */
    public Page<ListagemEventoDto> calendario(
            DadosAutenticacao usuario, Long alunoId, LocalDate dataInicio, LocalDate dataFim, Pageable paginacao) {
        var aluno = guard.assertPodeVer(usuario, alunoId);
        return eventoService.listar(
                aluno.getTurma() == null ? null : aluno.getTurma().getId(),
                aluno.getSerie() == null ? null : aluno.getSerie().getId(),
                aluno.getUnidade() == null ? null : aluno.getUnidade().getId(),
                null,
                dataInicio,
                dataFim,
                paginacao);
    }

    // -------------------------------------------------------------- saude/$$

    public DetalhamentoFichaMedicaDto fichaMedica(DadosAutenticacao usuario, Long alunoId) {
        guard.assertPodeVer(usuario, alunoId);
        return fichaMedicaService.buscarPorAluno(alunoId);
    }

    /** Gate duplo: vinculo com o aluno E flag Responsavel.financeiro. */
    public List<ListagemAlunoProdutoDto> financeiro(DadosAutenticacao usuario, Long alunoId) {
        guard.assertPodeVerFinanceiro(usuario, alunoId);
        return alunoProdutoService.listarPorAluno(alunoId);
    }

    // --------------------------------------------------------------- helpers

    private Long turmaDe(br.com.brain.aluno.Aluno aluno) {
        if (aluno.getTurma() == null) {
            throw new OperacaoInvalidaException(
                    "Aluno ainda nao esta vinculado a uma turma.");
        }
        return aluno.getTurma().getId();
    }
}
