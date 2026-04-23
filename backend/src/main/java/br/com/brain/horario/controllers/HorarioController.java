package br.com.brain.horario.controllers;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.brain.horario.dtos.AtualizacaoHorarioDto;
import br.com.brain.horario.dtos.CadastroHorarioDto;
import br.com.brain.horario.dtos.ListagemHorarioDto;
import br.com.brain.horario.services.HorarioService;
import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("horario")
public class HorarioController {

    private final HorarioService service;

    @PostMapping
    public ResponseEntity<ListagemHorarioDto> cadastrar(
            @RequestBody @Valid CadastroHorarioDto dados, UriComponentsBuilder uriBuilder) {
        var horario = service.cadastrarHorario(dados);
        var uri = uriBuilder.path("/horario/{id}").buildAndExpand(horario.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemHorarioDto(horario));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemHorarioDto>> listar(
            @PageableDefault(size = 10, sort = { "horarioInicio" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemHorarioDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoHorarioDto dados) {
        var horario = service.atualizar(id, dados);
        return ResponseEntity.ok(new ListagemHorarioDto(horario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemHorarioDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemHorarioDto> detalhar(@PathVariable("id") Long id) {
        var horario = service.detalhar(id);
        return ResponseEntity.ok(new ListagemHorarioDto(horario));
    }
}
