package br.com.brain.configuracaoAcademica;

import br.com.brain.matricula.ViradaAnoService;
import br.com.brain.matricula.dto.CopiaTurmasDto;
import br.com.brain.matricula.dto.EncerramentoAnoDto;
import br.com.brain.matricula.dto.PreviaEncerramentoDto;
import br.com.brain.matricula.dto.RematriculaDto;
import br.com.brain.matricula.dto.RematriculaRequest;
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
    private final ViradaAnoService viradaAnoService;

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

    @PostMapping("/{ano}/periodos/{sequencia}/fechar")
    public ResponseEntity<AnoLetivoDto> fecharPeriodo(@PathVariable int ano, @PathVariable int sequencia) {
        return ResponseEntity.ok(service.fecharPeriodo(ano, sequencia));
    }

    @PostMapping("/{ano}/periodos/{sequencia}/reabrir")
    public ResponseEntity<AnoLetivoDto> reabrirPeriodo(@PathVariable int ano, @PathVariable int sequencia) {
        return ResponseEntity.ok(service.reabrirPeriodo(ano, sequencia));
    }

    // ------------------------------------------------------------ virada de ano

    @GetMapping("/{ano}/encerramento")
    public ResponseEntity<PreviaEncerramentoDto> previaEncerramento(@PathVariable int ano) {
        return ResponseEntity.ok(viradaAnoService.previaEncerramento(ano));
    }

    @PostMapping("/{ano}/encerrar")
    public ResponseEntity<EncerramentoAnoDto> encerrar(@PathVariable int ano) {
        return ResponseEntity.ok(viradaAnoService.encerrar(ano));
    }

    /** Copia para {ano} as turmas de {ano - 1}. */
    @PostMapping("/{ano}/copiar-turmas")
    public ResponseEntity<CopiaTurmasDto> copiarTurmas(@PathVariable int ano) {
        return ResponseEntity.ok(viradaAnoService.copiarTurmas(ano));
    }

    /** Pré-matrículas em {ano} para quem concluiu {ano - 1}. */
    @PostMapping("/{ano}/rematricular")
    public ResponseEntity<RematriculaDto> rematricular(
            @PathVariable int ano, @RequestBody @Valid RematriculaRequest pedido) {
        return ResponseEntity.ok(viradaAnoService.rematricular(ano, pedido));
    }

    @PostMapping("/{ano}/abrir")
    public ResponseEntity<AnoLetivoDto> abrir(@PathVariable int ano) {
        return ResponseEntity.ok(service.abrir(ano));
    }
}
