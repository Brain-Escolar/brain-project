package br.com.brain.chamada;

import br.com.brain.chamada.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("chamada")
@RequiredArgsConstructor
public class ChamadaController {

    private final ChamadaService service;

    @PostMapping
    public ResponseEntity<List<ListagemChamadaDto>> cadastrar(
            @RequestBody @Valid CadastroChamadaDto dados, UriComponentsBuilder uriBuilder) {
        var chamadas = service.cadastrarChamada(dados);
        return ResponseEntity.status(201).body(chamadas);
    }

    @GetMapping
    public ResponseEntity<Page<ListagemChamadaDto>> listar(
            @PageableDefault(size = 10, sort = { "aluno" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemChamadaDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoChamadaDto dados) {
        var chamada = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemChamadaDto(chamada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ListagemChamadaDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemChamadaDto> detalhar(@PathVariable("id") Long id) {
        var chamada = service.detalhar(id);
        return ResponseEntity.ok(new ListagemChamadaDto(chamada));
    }

    @GetMapping("/aula/{aulaId}/data/{data}")
    public ResponseEntity<List<ListagemChamadaDto>> buscarPorAulaEData(
            @PathVariable Long aulaId, @PathVariable LocalDate data) {
        var chamadas = service.buscarPorAulaEData(aulaId, data);
        return ResponseEntity.ok(chamadas);
    }

    @PutMapping("/aula/{aulaId}/data/{data}")
    public ResponseEntity<List<ListagemChamadaDto>> atualizarLote(
            @PathVariable Long aulaId, @PathVariable LocalDate data,
            @RequestBody @Valid AtualizacaoChamadaLoteDto dados) {
        var chamadas = service.atualizarLote(aulaId, data, dados);
        return ResponseEntity.ok(chamadas);
    }
}
