package br.com.brain.financeiro;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.exception.ErrosSistema.AcessoNegadoException;
import br.com.brain.financeiro.dto.BaixaDto;
import br.com.brain.financeiro.dto.BaixaRequest;
import br.com.brain.financeiro.dto.EstornoRequest;
import br.com.brain.financeiro.dto.InadimplenciaDto;
import br.com.brain.financeiro.dto.PagamentoDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * O lado da escola: dar baixa, estornar, conferir o caixa e cobrar.
 *
 * A tela da familia nao passa por aqui -- fica em /portal-responsavel, com
 * perfil RESPONSAVEL e o guard de vinculo. Prefixos separados de proposito: um
 * matcher de seguranca errado neste arquivo nao pode abrir o financeiro da
 * escola para a familia, nem o contrario.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("financeiro")
public class FinanceiroController {

    private final BaixaTituloService baixaService;
    private final InadimplenciaService inadimplenciaService;

    /** Baixa manual. O operador sai da sessao, nunca do corpo do pedido. */
    @PostMapping("/titulos/{tituloId}/baixa")
    public ResponseEntity<BaixaDto> baixar(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("tituloId") Long tituloId,
            @RequestBody @Valid BaixaRequest pedido) {
        return ResponseEntity.ok(baixaService.baixar(tituloId, pedido, operador(usuario)));
    }

    @PostMapping("/pagamentos/{pagamentoId}/estorno")
    public ResponseEntity<BaixaDto> estornar(
            @AuthenticationPrincipal DadosAutenticacao usuario,
            @PathVariable("pagamentoId") Long pagamentoId,
            @RequestBody @Valid EstornoRequest pedido) {
        return ResponseEntity.ok(baixaService.estornar(pagamentoId, pedido, operador(usuario)));
    }

    /** Historico de baixas da parcela, estornadas inclusive. */
    @GetMapping("/titulos/{tituloId}/pagamentos")
    public ResponseEntity<List<PagamentoDto>> pagamentosDoTitulo(
            @PathVariable("tituloId") Long tituloId) {
        return ResponseEntity.ok(baixaService.doTitulo(tituloId));
    }

    @GetMapping("/caixa")
    public ResponseEntity<List<PagamentoDto>> caixaDoDia(
            @RequestParam(value = "data", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(baixaService.caixaDoDia(data));
    }

    /**
     * Inadimplencia com aging.
     *
     * `referencia` permite reabrir o fechamento do mes passado sem recalcular na
     * mao -- o aging de 30/09 visto em outubro tem de dar o mesmo numero que
     * dava em 30/09.
     */
    @GetMapping("/inadimplencia")
    public ResponseEntity<InadimplenciaDto> inadimplencia(
            @RequestParam(value = "unidadeId", required = false) Long unidadeId,
            @RequestParam(value = "anoLetivo", required = false) Integer anoLetivo,
            @RequestParam(value = "referencia", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate referencia) {
        return ResponseEntity.ok(inadimplenciaService.apurar(unidadeId, anoLetivo, referencia));
    }

    private Long operador(DadosAutenticacao usuario) {
        if (usuario == null || usuario.getDadosPessoais() == null) {
            throw new AcessoNegadoException("Sessão sem usuário autenticado.");
        }
        return usuario.getDadosPessoais().getId();
    }
}
