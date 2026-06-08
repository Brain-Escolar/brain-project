package br.com.brain.evento;

import br.com.brain.evento.dto.AtualizacaoEventoDto;
import br.com.brain.evento.dto.CadastroEventoDto;
import br.com.brain.evento.dto.DetalhamentoEventoDto;
import br.com.brain.evento.dto.ListagemEventoDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;

@RestController
@RequestMapping("evento")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService service;

    @PostMapping
    public ResponseEntity<DetalhamentoEventoDto> cadastrar(
            @RequestBody @Valid CadastroEventoDto dados, UriComponentsBuilder uriBuilder) {
        var evento = service.cadastrar(dados);
        var uri = uriBuilder.path("/evento/{id}").buildAndExpand(evento.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoEventoDto(evento));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemEventoDto>> listar(
            @RequestParam(required = false) Long turmaId,
            @RequestParam(required = false) Long serieId,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) Long professorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @PageableDefault(size = 200) Pageable pageable) {
        var page = service.listar(turmaId, serieId, unidadeId, professorId, dataInicio, dataFim, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoEventoDto> detalhar(@PathVariable Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoEventoDto> atualizar(
            @PathVariable Long id, @RequestBody @Valid AtualizacaoEventoDto dados) {
        var evento = service.atualizar(dados, id);
        return ResponseEntity.ok(new DetalhamentoEventoDto(evento));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
