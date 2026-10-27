package br.com.brain.configuracaoAcademica;

import br.com.brain.configuracaoAcademica.dto.AnoLetivoDto;
import br.com.brain.configuracaoAcademica.dto.CadastroAnoLetivoRequest;
import br.com.brain.configuracaoAcademica.dto.PeriodosLetivosRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Anos letivos e seus períodos. Leitura é de todo usuário logado (o seletor de
 * ano aparece em todas as telas); escrita é da Direção. Ver
 * SecurityConfigurations.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("anos-letivos")
public class AnoLetivoController {

    private final AnoLetivoService service;

    @GetMapping
    public ResponseEntity<List<AnoLetivoDto>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/corrente")
    public ResponseEntity<AnoLetivoDto> corrente() {
        return ResponseEntity.ok(service.detalharCorrente());
    }

    @GetMapping("/{ano}")
    public ResponseEntity<AnoLetivoDto> detalhar(@PathVariable int ano) {
        return ResponseEntity.ok(service.detalhar(ano));
    }

    @PostMapping
    public ResponseEntity<AnoLetivoDto> criar(@RequestBody @Valid CadastroAnoLetivoRequest pedido) {
        return ResponseEntity.ok(service.criar(pedido.ano()));
    }

    @PutMapping("/{ano}/periodos")
    public ResponseEntity<AnoLetivoDto> salvarPeriodos(
            @PathVariable int ano, @RequestBody @Valid PeriodosLetivosRequest pedido) {
        return ResponseEntity.ok(service.salvarPeriodos(ano, pedido));
    }

    @PostMapping("/{ano}/abrir")
    public ResponseEntity<AnoLetivoDto> abrir(@PathVariable int ano) {
        return ResponseEntity.ok(service.abrir(ano));
    }
}
