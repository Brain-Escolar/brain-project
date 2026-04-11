package br.com.brain.controller;

import br.com.brain.dto.aluno.AtualizacaoAlunoDto;
import br.com.brain.dto.aluno.CadastroAlunoDto;
import br.com.brain.dto.aluno.DetalhamentoAlunoDto;
import br.com.brain.dto.aluno.ListagemAlunoDto;
import br.com.brain.dto.anotacao.AnotacaoAlunoDisciplinaDto;
import java.util.List;
import br.com.brain.dto.fichamedica.DetalhamentoFichaMedicaDto;
import br.com.brain.dto.serie.SerieUnidadeTurmaDto;
import br.com.brain.service.AlunoService;
import br.com.brain.service.AnotacaoService;
import br.com.brain.service.FichaMedicaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("aluno")
@RequiredArgsConstructor
public class AlunoController {

    private final AlunoService service;
    private final FichaMedicaService fichaMedicaService;
    private final AnotacaoService anotacaoService;

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
    public ResponseEntity<DetalhamentoAlunoDto> detalhar(@PathVariable("id") Long id) {
        var aluno = service.detalhar(id);
        return ResponseEntity.ok(new DetalhamentoAlunoDto(aluno));
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
}
