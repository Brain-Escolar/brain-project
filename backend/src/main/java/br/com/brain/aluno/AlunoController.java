package br.com.brain.aluno;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.shared.DataDto;
import br.com.brain.aluno.dto.AtualizacaoAlunoDto;
import br.com.brain.aluno.dto.AtualizacaoCursoPretendidoDto;
import br.com.brain.aluno.dto.CadastroAlunoDto;
import br.com.brain.aluno.dto.CursoPretendidoDto;
import br.com.brain.aluno.dto.DetalhamentoAlunoDto;
import br.com.brain.aluno.dto.ListagemAlunoDto;
import org.springframework.http.converter.json.MappingJacksonValue;
import br.com.brain.anotacao.dto.AnotacaoAlunoDisciplinaDto;
import br.com.brain.anotacao.dto.ListagemAnotacaoSemanaDto;
import br.com.brain.aula.dto.ListagemAulaAlunoDto;
import br.com.brain.tarefa.dto.ListagemTarefaAlunoDto;
import java.util.List;
import br.com.brain.fichamedica.dto.DetalhamentoFichaMedicaDto;
import br.com.brain.serie.dto.SerieUnidadeTurmaDto;
import br.com.brain.anotacao.AnotacaoService;
import br.com.brain.aula.AulaService;
import br.com.brain.fichamedica.FichaMedicaService;
import br.com.brain.tarefa.TarefaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("aluno")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService service;
    private final FichaMedicaService fichaMedicaService;
    private final AnotacaoService anotacaoService;
    private final AulaService aulaService;
    private final TarefaService tarefaService;

    @PostMapping
    public ResponseEntity<DetalhamentoAlunoDto> cadastrar(
            @RequestBody @Valid CadastroAlunoDto dados, UriComponentsBuilder uriBuilder) {
        var aluno = service.cadastrarAluno(dados);
        var uri = uriBuilder.path("/aluno/{id}").buildAndExpand(aluno.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping("leads")
    public ResponseEntity<Page<ListagemAlunoDto>> listarLeads(
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        var page = service.listarLeads(paginacao);
        return ResponseEntity.ok(page);
    }

    @PostMapping("matricular/{id}")
    public ResponseEntity<DetalhamentoAlunoDto> matricular(@PathVariable("id") Long id) {
        var aluno = service.matricular(id);
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemAlunoDto>> listarAlunos(
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        var page = service.listarAlunos(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoAlunoDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoAlunoDto dados) {
        var aluno = service.atualizar(id, dados);
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @PostMapping("vincular-serie/{id}")
    public ResponseEntity<DetalhamentoAlunoDto> vincularSerie(@PathVariable("id") Long id,
            @RequestBody @Valid SerieUnidadeTurmaDto dados) {
        var aluno = service.vincularSerie(id, dados);
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @PostMapping("desmatricular/{id}")
    public ResponseEntity<DetalhamentoAlunoDto> desmatricular(@PathVariable("id") Long id) {
        var aluno = service.desmatricular(id);
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MappingJacksonValue> detalhar(
            @PathVariable Long id,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var perfil = usuario.getDadosPessoais().getPerfis().stream()
                .findFirst()
                .map(p -> p.getNome())
                .orElseThrow(() -> ErrosSistema.OperacaoInvalidaException.com("Usuário sem perfil definido."));
        var aluno = service.detalhar(id);
        var jackson = new MappingJacksonValue(new DetalhamentoAlunoDto(aluno));
        jackson.setSerializationView(AlunoViews.paraPerfil(perfil));
        return ResponseEntity.ok(jackson);
    }

    @GetMapping("/{id}/ficha-medica")
    public ResponseEntity<DetalhamentoFichaMedicaDto> buscarFichaMedica(@PathVariable Long id) {
        return ResponseEntity.ok(fichaMedicaService.buscarPorAluno(id));
    }

    @GetMapping("/{id}/anotacoes/{disciplinaId}")
    public ResponseEntity<List<AnotacaoAlunoDisciplinaDto>> buscarAnotacoesPorDisciplina(
            @PathVariable Long id, @PathVariable Long disciplinaId) {
        return ResponseEntity.ok(anotacaoService.buscarPorAlunoEDisciplina(id, disciplinaId));
    }

    @PostMapping("/aulas")
    public ResponseEntity<Page<ListagemAulaAlunoDto>> recuperarAulas(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @RequestBody @Valid DataDto data,
            @PageableDefault(size = 10, sort = { "horario.horarioInicio" }) Pageable paginacao) {
        var aluno = service.recuperarAlunoPorDadosPessoais(usuario.getDadosPessoais().getId());
        var aulas = aulaService.recuperarAulasPeloAlunoEData(aluno.getTurma().getId(), data.data(), paginacao);
        return ResponseEntity.ok(aulas);
    }

    @GetMapping("/aulas/semana")
    public ResponseEntity<List<ListagemAulaAlunoDto>> recuperarAulasSemana(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var aluno = service.recuperarAlunoPorDadosPessoais(usuario.getDadosPessoais().getId());
        var aulas = aulaService.recuperarAulasSemanalAluno(aluno.getTurma().getId());
        return ResponseEntity.ok(aulas);
    }

    @GetMapping("/anotacoes/semana")
    public ResponseEntity<List<ListagemAnotacaoSemanaDto>> recuperarAnotacoesSemana(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var aluno = service.recuperarAlunoPorDadosPessoais(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(anotacaoService.recuperarAnotacoesSemana(aluno.getId()));
    }

    @GetMapping("/cursos-pretendidos")
    public ResponseEntity<List<CursoPretendidoDto>> listarCursosPretendidos() {
        return ResponseEntity.ok(service.listarCursosPretendidos());
    }

    @PatchMapping("/curso-pretendido")
    public ResponseEntity<DetalhamentoAlunoDto> atualizarCursoPretendido(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @RequestBody @Valid AtualizacaoCursoPretendidoDto dados) {
        var aluno = service.atualizarCursoPretendido(usuario.getDadosPessoais().getId(), dados.cursoPretendido());
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping("/perfil")
    public ResponseEntity<DetalhamentoAlunoDto> buscarPerfil(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var aluno = service.recuperarAlunoPorDadosPessoais(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping("/tarefas")
    public ResponseEntity<Page<ListagemTarefaAlunoDto>> recuperarTarefas(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PageableDefault(size = 10, sort = { "prazo" }) Pageable paginacao) {
        var aluno = service.recuperarAlunoPorDadosPessoais(usuario.getDadosPessoais().getId());
        var tarefas = tarefaService.recuperarTarefasAluno(aluno.getTurma().getId(), paginacao);
        return ResponseEntity.ok(tarefas);
    }
}
