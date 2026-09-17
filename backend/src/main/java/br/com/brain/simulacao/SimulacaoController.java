package br.com.brain.simulacao;

import br.com.brain.simulacao.dto.CriarSimulacaoRequest;
import br.com.brain.simulacao.dto.SimulacaoDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("simulacoes")
public class SimulacaoController {

    private final SimulacaoService service;

    /** Monta a proposta a partir do catalogo vigente. Sem bolsa ainda. */
    @PostMapping
    public ResponseEntity<SimulacaoDto> criar(@RequestBody @Valid CriarSimulacaoRequest pedido) {
        return ResponseEntity.ok(service.criar(pedido));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SimulacaoDto> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscar(id));
    }

    /** As propostas de um lead do CRM, da mais recente para a mais antiga. */
    @GetMapping
    public ResponseEntity<List<SimulacaoDto>> listar(
            @RequestParam(value = "processoMatriculaId", required = false) Long processoMatriculaId,
            @RequestParam(value = "alunoId", required = false) Long alunoId) {

        if (processoMatriculaId != null) {
            return ResponseEntity.ok(service.doProcesso(processoMatriculaId));
        }
        if (alunoId != null) {
            return ResponseEntity.ok(service.doAluno(alunoId));
        }
        return ResponseEntity.ok(List.of());
    }
}
