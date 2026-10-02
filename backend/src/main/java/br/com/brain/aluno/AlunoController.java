package br.com.brain.aluno;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.shared.DataDto;
import br.com.brain.aluno.dto.AtualizacaoAlunoDto;
import br.com.brain.aluno.dto.AtualizacaoCursoPretendidoDto;
import br.com.brain.aluno.dto.CadastroAlunoDto;
import br.com.brain.aluno.dto.CursoPretendidoDto;
import br.com.brain.aluno.dto.DesmatriculaAlunoDto;
import br.com.brain.aluno.dto.DetalhamentoAlunoDto;
import br.com.brain.aluno.dto.ListagemAlunoDto;
import br.com.brain.anotacao.dto.AnotacaoAlunoDisciplinaDto;
import br.com.brain.anotacao.dto.ListagemAnotacaoSemanaDto;
import br.com.brain.aula.dto.ListagemAulaAlunoDto;
import br.com.brain.tarefa.dto.ListagemTarefaAlunoDto;
import java.util.List;
import br.com.brain.fichamedica.dto.AtualizacaoFichaMedicaDto;
import br.com.brain.fichamedica.dto.CadastroLaudoDto;
import br.com.brain.fichamedica.dto.DetalhamentoFichaMedicaDto;
import br.com.brain.medicacao.dto.CadastroMedicacaoDto;
import br.com.brain.atendimentoPsicologico.dto.CadastroAtendimentoPsicologicoDto;
import br.com.brain.atendimentoPsicologico.dto.ListagemAtendimentoPsicologicoDto;
import br.com.brain.situacaoFamiliar.dto.AtualizacaoSituacaoFamiliarDto;
import br.com.brain.situacaoFamiliar.dto.DetalhamentoSituacaoFamiliarDto;
import br.com.brain.serie.dto.SerieUnidadeTurmaDto;
import br.com.brain.anotacao.AnotacaoService;
import br.com.brain.aula.AulaService;
import br.com.brain.fichamedica.FichaMedicaService;
import br.com.brain.atendimentoPsicologico.AtendimentoPsicologicoService;
import br.com.brain.situacaoFamiliar.SituacaoFamiliarService;
import br.com.brain.materialComplementar.MaterialComplementarService;
import br.com.brain.materialComplementar.dto.ListagemMaterialComplementarDto;
import br.com.brain.tarefa.TarefaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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
    private final MaterialComplementarService materialComplementarService;
    private final SituacaoFamiliarService situacaoFamiliarService;
    private final AtendimentoPsicologicoService atendimentoPsicologicoService;

    @PostMapping
    public ResponseEntity<DetalhamentoAlunoDto> cadastrar(
            @RequestBody @Valid CadastroAlunoDto dados, UriComponentsBuilder uriBuilder) {
        var aluno = service.cadastrarAluno(dados);
        var uri = uriBuilder.path("/aluno/{id}").buildAndExpand(aluno.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping("leads")
    public ResponseEntity<Page<ListagemAlunoDto>> listarLeads(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Long serieId,
            @RequestParam(required = false) Long unidadeId,
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        var page = service.listarLeads(busca, serieId, unidadeId, paginacao);
        return ResponseEntity.ok(page);
    }

    @GetMapping("desmatriculados")
    public ResponseEntity<Page<ListagemAlunoDto>> listarDesmatriculados(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Long serieId,
            @RequestParam(required = false) Long unidadeId,
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        var page = service.listarDesmatriculados(busca, serieId, unidadeId, paginacao);
        return ResponseEntity.ok(page);
    }

    @PostMapping("matricular/{id}")
    public ResponseEntity<DetalhamentoAlunoDto> matricular(@PathVariable("id") Long id) {
        var aluno = service.matricular(id);
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemAlunoDto>> listarAlunos(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) Long serieId,
            @RequestParam(required = false) Long unidadeId,
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        var page = service.listarAlunos(busca, serieId, unidadeId, paginacao);
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
    public ResponseEntity<DetalhamentoAlunoDto> desmatricular(@PathVariable("id") Long id,
            @RequestBody(required = false) DesmatriculaAlunoDto dados) {
        var aluno = service.desmatricular(id, dados == null ? null : dados.motivo());
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @PostMapping("rematricular/{id}")
    public ResponseEntity<DetalhamentoAlunoDto> rematricular(@PathVariable("id") Long id) {
        var aluno = service.rematricular(id);
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping("/{id}")
    @PerfilAlunoView
    public ResponseEntity<DetalhamentoAlunoDto> detalhar(@PathVariable Long id) {
        var aluno = service.detalhar(id);
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
    }

    @GetMapping("/{id}/ficha-medica")
    public ResponseEntity<DetalhamentoFichaMedicaDto> buscarFichaMedica(@PathVariable Long id) {
        return ResponseEntity.ok(fichaMedicaService.buscarPorAluno(id));
    }

    @PutMapping("/{id}/ficha-medica")
    public ResponseEntity<DetalhamentoFichaMedicaDto> atualizarFichaMedica(
            @PathVariable Long id, @RequestBody @Valid AtualizacaoFichaMedicaDto dados) {
        return ResponseEntity.ok(fichaMedicaService.atualizarPorAluno(id, dados));
    }

    @PostMapping(path = "/{id}/ficha-medica/laudos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DetalhamentoFichaMedicaDto> anexarLaudo(
            @PathVariable Long id,
            @RequestPart("arquivo") MultipartFile arquivo,
            @RequestPart("dados") @Valid CadastroLaudoDto dados) {
        return ResponseEntity.ok(fichaMedicaService.anexarLaudo(id, arquivo, dados));
    }

    @DeleteMapping("/{id}/ficha-medica/laudos/{laudoId}")
    public ResponseEntity<DetalhamentoFichaMedicaDto> removerLaudo(
            @PathVariable Long id, @PathVariable Long laudoId) {
        return ResponseEntity.ok(fichaMedicaService.removerLaudo(id, laudoId));
    }

    @PostMapping(path = "/{id}/ficha-medica/medicacoes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DetalhamentoFichaMedicaDto> anexarMedicacao(
            @PathVariable Long id,
            @RequestPart(name = "arquivo", required = false) MultipartFile arquivo,
            @RequestPart("dados") @Valid CadastroMedicacaoDto dados) {
        return ResponseEntity.ok(fichaMedicaService.anexarMedicacao(id, arquivo, dados));
    }

    @PutMapping("/{id}/ficha-medica/medicacoes/{medicacaoId}")
    public ResponseEntity<DetalhamentoFichaMedicaDto> atualizarMedicacao(
            @PathVariable Long id, @PathVariable Long medicacaoId,
            @RequestBody @Valid CadastroMedicacaoDto dados) {
        return ResponseEntity.ok(fichaMedicaService.atualizarMedicacao(id, medicacaoId, dados));
    }

    /** Desativa, não apaga: a medicação sai da ficha e fica no histórico. */
    @DeleteMapping("/{id}/ficha-medica/medicacoes/{medicacaoId}")
    public ResponseEntity<DetalhamentoFichaMedicaDto> desativarMedicacao(
            @PathVariable Long id, @PathVariable Long medicacaoId) {
        return ResponseEntity.ok(fichaMedicaService.desativarMedicacao(id, medicacaoId));
    }

    @GetMapping("/{id}/situacao-familiar")
    public ResponseEntity<DetalhamentoSituacaoFamiliarDto> buscarSituacaoFamiliar(@PathVariable Long id) {
        return ResponseEntity.ok(situacaoFamiliarService.buscarPorAluno(id));
    }

    @PutMapping("/{id}/situacao-familiar")
    public ResponseEntity<DetalhamentoSituacaoFamiliarDto> salvarSituacaoFamiliar(
            @PathVariable Long id, @RequestBody @Valid AtualizacaoSituacaoFamiliarDto dados) {
        return ResponseEntity.ok(situacaoFamiliarService.salvar(id, dados));
    }

    @GetMapping("/{id}/atendimentos-psicologicos")
    public ResponseEntity<List<ListagemAtendimentoPsicologicoDto>> listarAtendimentosPsicologicos(
            @PathVariable Long id) {
        return ResponseEntity.ok(atendimentoPsicologicoService.listarPorAluno(id));
    }

    /** Atendimento é histórico clínico: só acrescenta, não há PUT nem DELETE. */
    @PostMapping("/{id}/atendimentos-psicologicos")
    public ResponseEntity<ListagemAtendimentoPsicologicoDto> registrarAtendimentoPsicologico(
            @PathVariable Long id, @RequestBody @Valid CadastroAtendimentoPsicologicoDto dados) {
        return ResponseEntity.ok(atendimentoPsicologicoService.registrar(id, dados));
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

    @GetMapping("/materiais-complementares")
    public ResponseEntity<List<ListagemMaterialComplementarDto>> recuperarMateriaisComplementares(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var aluno = service.recuperarAlunoPorDadosPessoais(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(materialComplementarService.listarPorAluno(aluno.getTurma().getId()));
    }
}
