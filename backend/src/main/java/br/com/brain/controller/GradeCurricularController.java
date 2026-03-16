package br.com.brain.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.brain.dto.gradeCurricular.AtualizacaoGradeCurricularDto;
import br.com.brain.dto.gradeCurricular.CadastroDisciplinaGradeDto;
import br.com.brain.dto.gradeCurricular.CadastroGradeCurricularDto;
import br.com.brain.dto.gradeCurricular.ListagemGradeCurricularDto;
import br.com.brain.service.GradeCurricularService;
import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("grade-curricular")
public class GradeCurricularController {

    private final GradeCurricularService service;

    @PostMapping
    public ResponseEntity<ListagemGradeCurricularDto> cadastrar(
            @RequestBody @Valid CadastroGradeCurricularDto dados, UriComponentsBuilder uriBuilder) {
        var gradeCurricular = service.cadastrarGradeCurricular(dados);
        var uri = uriBuilder.path("/gradeCurricular/{id}").buildAndExpand(gradeCurricular.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemGradeCurricularDto(gradeCurricular));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemGradeCurricularDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemGradeCurricularDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoGradeCurricularDto dados) {
        var gradeCurricular = service.atualizar(id, dados);
        return ResponseEntity.ok(new ListagemGradeCurricularDto(gradeCurricular));
    }

    @GetMapping("/desativar/{id}")
    public ResponseEntity<ListagemGradeCurricularDto> desativar(@PathVariable("id") Long id) {
        var gradeCurricular = service.desativar(id);
        return ResponseEntity.ok(new ListagemGradeCurricularDto(gradeCurricular));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemGradeCurricularDto> detalhar(@PathVariable("id") Long id) {
        var gradeCurricular = service.detalhar(id);
        return ResponseEntity.ok(new ListagemGradeCurricularDto(gradeCurricular));
    }

    @PostMapping("/disciplinas")
    public ResponseEntity<ListagemGradeCurricularDto> adicionarDisciplinas(@RequestBody @Valid CadastroDisciplinaGradeDto dados) {
        var gradeCurricular = service.adicionarDisciplinas(dados);
        return ResponseEntity.ok(new ListagemGradeCurricularDto(gradeCurricular));
    }
}
