package br.com.brain.avaliacao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.avaliacao.dto.AtualizacaoAvaliacaoDto;
import br.com.brain.avaliacao.dto.AtualizacaoAvaliacaoTurmaDto;
import br.com.brain.avaliacao.dto.CadastroAvaliacaoDto;
import br.com.brain.avaliacao.dto.CadastroAvaliacaoTurmaDto;
import br.com.brain.avaliacao.dto.CadastroNotasAvaliacaoDto;
import br.com.brain.avaliacao.dto.DetalhamentoAvaliacaoDto;
import br.com.brain.aluno.dto.NomeAlunoDto;
import br.com.brain.avaliacao.dto.ListagemAvaliacaoDto;
import br.com.brain.avaliacao.dto.ListagemAvaliacaoTurmaDto;

import java.util.List;
import br.com.brain.professor.ProfessorService;
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
@RequiredArgsConstructor
@RequestMapping("avaliacao")
public class AvaliacaoController {

    private final AvaliacaoService service;
    private final AvaliacaoTurmaService avaliacaoTurmaService;
    private final ProfessorService professorService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DetalhamentoAvaliacaoDto> cadastrar(
            @RequestPart("dados") @Valid CadastroAvaliacaoDto dados,
            @RequestPart(value = "anexos", required = false) List<MultipartFile> anexos,
            @AuthenticationPrincipal DadosAutenticacao usuario,
            UriComponentsBuilder uriBuilder) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var avaliacao = service.cadastrarAvaliacao(dados, anexos, professor.getId());
        var uri = uriBuilder
                .path("/avaliacao/{id}")
                .buildAndExpand(avaliacao.getId()).toUri();
        return ResponseEntity.created(uri).body(service.detalhar(avaliacao.getId()));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemAvaliacaoDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoAvaliacaoDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoAvaliacaoDto dados) {
        service.atualizar(dados, id);
        return ResponseEntity.ok(service.detalhar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoAvaliacaoDto> detalhar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }

    @GetMapping("/professor")
    public ResponseEntity<Page<ListagemAvaliacaoDto>> listarPorProfessor(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(service.listarPorProfessor(professor.getId(), paginacao));
    }

    @GetMapping("/{avaliacaoId}/turmas")
    public ResponseEntity<List<ListagemAvaliacaoTurmaDto>> listarTurmas(@PathVariable Long avaliacaoId) {
        return ResponseEntity.ok(avaliacaoTurmaService.listarResumoPorAvaliacao(avaliacaoId));
    }

    @PostMapping("/{avaliacaoId}/turmas")
    public ResponseEntity<ListagemAvaliacaoTurmaDto> adicionarTurma(
            @PathVariable Long avaliacaoId,
            @RequestBody @Valid CadastroAvaliacaoTurmaDto dados,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var avaliacaoTurma = avaliacaoTurmaService.adicionarTurma(avaliacaoId, dados, professor.getId());
        return ResponseEntity.ok(avaliacaoTurmaService.construirListagem(avaliacaoTurma));
    }

    @PutMapping("/turmas/{avaliacaoTurmaId}")
    public ResponseEntity<ListagemAvaliacaoTurmaDto> atualizarTurma(
            @PathVariable Long avaliacaoTurmaId,
            @RequestBody @Valid AtualizacaoAvaliacaoTurmaDto dados) {
        var avaliacaoTurma = avaliacaoTurmaService.atualizarDatas(avaliacaoTurmaId, dados);
        return ResponseEntity.ok(avaliacaoTurmaService.construirListagem(avaliacaoTurma));
    }

    @DeleteMapping("/turmas/{avaliacaoTurmaId}")
    public ResponseEntity<Void> excluirTurma(@PathVariable Long avaliacaoTurmaId) {
        avaliacaoTurmaService.excluir(avaliacaoTurmaId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/turmas/{avaliacaoTurmaId}/notas")
    public ResponseEntity<Void> cadastrarNotasPorTurma(
            @PathVariable Long avaliacaoTurmaId,
            @RequestBody @Valid CadastroNotasAvaliacaoDto dados) {
        avaliacaoTurmaService.cadastrarNotas(avaliacaoTurmaId, dados);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/turmas/{avaliacaoTurmaId}/alunos")
    public ResponseEntity<List<NomeAlunoDto>> recuperarAlunosPorTurma(
            @PathVariable Long avaliacaoTurmaId) {
        return ResponseEntity.ok(avaliacaoTurmaService.recuperarAlunosPorAvaliacaoTurma(avaliacaoTurmaId));
    }
}
