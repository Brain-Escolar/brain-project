package br.com.brain.responsavel.portal;

import br.com.brain.aluno.dto.DetalhamentoAlunoDto;
import br.com.brain.anotacao.dto.AnotacaoAlunoDisciplinaDto;
import br.com.brain.anotacao.dto.ListagemAnotacaoSemanaDto;
import br.com.brain.aula.dto.ListagemAulaDto;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.evento.dto.ListagemEventoDto;
import br.com.brain.fichamedica.dto.DetalhamentoFichaMedicaDto;
import br.com.brain.materialComplementar.dto.ListagemMaterialComplementarDto;
import br.com.brain.notas.dto.DetalhamentoNotasAlunoDisciplinaDto;
import br.com.brain.produto.dto.ListagemAlunoProdutoDto;
import br.com.brain.relatorios.dto.RelatorioDto;
import br.com.brain.responsavel.portal.dto.AlunoVinculadoDto;
import br.com.brain.responsavel.portal.dto.ResponsavelLogadoDto;
import br.com.brain.responsavel.portal.dto.ResumoAlunoDto;
import br.com.brain.tarefa.dto.ListagemTarefaAlunoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * Portal do Responsavel - superficie de leitura sobre os dados do
 * aluno vinculado.
 *
 * Namespace proprio, separado de /responsavel (que e o CRUD da secretaria
 * sobre a entidade Responsavel). Sao duas audiencias com modelos de
 * autorizacao opostos: la o perfil de escola, aqui o vinculo familiar.
 * Compartilhar o prefixo faria a regra de seguranca de um capturar as rotas
 * do outro.
 *
 * Todas as rotas sao somente leitura. A autorizacao tem duas camadas:
 * o perfil e barrado por URL matcher no SecurityConfigurations (padrao do
 * projeto), e o vinculo com aquele aluno especifico pelo
 * VinculoResponsavelGuard, dentro do service.
 */
@RestController
@RequestMapping("portal-responsavel")
@RequiredArgsConstructor
public class ResponsavelPortalController {

    private final ResponsavelPortalService service;

    // ---------------------------------------------------------------- sessao

    @GetMapping("/me")
    public ResponseEntity<ResponsavelLogadoDto> meusDados(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.meusDados(usuario));
    }

    @GetMapping("/alunos")
    /**
     * Alunos sob responsabilidade de quem esta logado - alimenta o seletor.
     *
     * Deliberadamente "alunos", nao "meus-filhos": GrauParentesco admite avo,
     * irmao, tutor e OUTRO, entao um responsavel nem sempre e pai ou mae. O
     * escopo "meus" ja vem do namespace /portal-responsavel.
     */
    public ResponseEntity<List<AlunoVinculadoDto>> alunosVinculados(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.alunosVinculados(usuario));
    }

    // ------------------------------------------------------------------ home

    @GetMapping("/aluno/{alunoId}/resumo")
    public ResponseEntity<ResumoAlunoDto> resumo(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.resumo(usuario, alunoId));
    }

    // ------------------------------------------------------------ pedagogico

    @GetMapping("/aluno/{alunoId}/perfil")
    public ResponseEntity<DetalhamentoAlunoDto> perfil(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.perfil(usuario, alunoId));
    }

    @GetMapping("/aluno/{alunoId}/relatorio")
    public ResponseEntity<RelatorioDto> relatorio(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.relatorio(usuario, alunoId));
    }

    @GetMapping("/aluno/{alunoId}/notas/{disciplinaId}")
    public ResponseEntity<DetalhamentoNotasAlunoDisciplinaDto> notasPorDisciplina(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId,
            @PathVariable("disciplinaId") Long disciplinaId) {
        return ResponseEntity.ok(service.notasPorDisciplina(usuario, alunoId, disciplinaId));
    }

    @GetMapping("/aluno/{alunoId}/ocorrencias")
    public ResponseEntity<List<ListagemAnotacaoSemanaDto>> ocorrencias(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.ocorrenciasDaSemana(usuario, alunoId));
    }

    @GetMapping("/aluno/{alunoId}/ocorrencias/{disciplinaId}")
    public ResponseEntity<List<AnotacaoAlunoDisciplinaDto>> ocorrenciasPorDisciplina(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId,
            @PathVariable("disciplinaId") Long disciplinaId) {
        return ResponseEntity.ok(service.ocorrenciasPorDisciplina(usuario, alunoId, disciplinaId));
    }

    @GetMapping("/aluno/{alunoId}/grade-horaria")
    public ResponseEntity<List<ListagemAulaDto>> gradeHoraria(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.gradeHoraria(usuario, alunoId));
    }

    @GetMapping("/aluno/{alunoId}/tarefas")
    public ResponseEntity<Page<ListagemTarefaAlunoDto>> tarefas(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId,
            @PageableDefault(size = 10, sort = { "prazo" }) Pageable paginacao) {
        return ResponseEntity.ok(service.tarefas(usuario, alunoId, paginacao));
    }

    @GetMapping("/aluno/{alunoId}/materiais")
    public ResponseEntity<List<ListagemMaterialComplementarDto>> materiais(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.materiais(usuario, alunoId));
    }

    @GetMapping("/aluno/{alunoId}/calendario")
    public ResponseEntity<Page<ListagemEventoDto>> calendario(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @PageableDefault(size = 200) Pageable paginacao) {
        return ResponseEntity.ok(service.calendario(usuario, alunoId, dataInicio, dataFim, paginacao));
    }

    // -------------------------------------------------------------- saude/$$

    @GetMapping("/aluno/{alunoId}/ficha-medica")
    public ResponseEntity<DetalhamentoFichaMedicaDto> fichaMedica(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.fichaMedica(usuario, alunoId));
    }

    @GetMapping("/aluno/{alunoId}/financeiro")
    public ResponseEntity<List<ListagemAlunoProdutoDto>> financeiro(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.financeiro(usuario, alunoId));
    }
}
