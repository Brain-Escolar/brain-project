package br.com.brain.contrato;

import br.com.brain.contrato.dto.ContratoDto;
import br.com.brain.contrato.dto.EfetivarMatriculaRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("contratos")
public class ContratoController {

    private final MatriculaEfetivacaoService efetivacaoService;

    /**
     * Efetiva a matricula: cria matricula, contrato, itens e titulos a partir da
     * proposta, e transforma a reserva de bolsa em compromisso. Tudo numa
     * transacao.
     */
    @PostMapping("/efetivar")
    public ResponseEntity<ContratoDto> efetivar(@RequestBody @Valid EfetivarMatriculaRequest pedido) {
        return ResponseEntity.ok(efetivacaoService.efetivar(pedido));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratoDto> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(efetivacaoService.buscarContrato(id));
    }

    /** Inclui rescindidos: a matrícula refeita tem mais de um contrato. */
    @GetMapping("/matriculas/{matriculaId}")
    public ResponseEntity<List<ContratoDto>> daMatricula(@PathVariable Long matriculaId) {
        return ResponseEntity.ok(efetivacaoService.contratosDaMatricula(matriculaId));
    }
}
