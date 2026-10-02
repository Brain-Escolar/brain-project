package br.com.brain.bolsa;

import br.com.brain.bolsa.dto.AlcadaDescontoDto;
import br.com.brain.bolsa.dto.AlcadaDescontoRequest;
import br.com.brain.bolsa.dto.ConciliacaoEnvelopeDto;
import br.com.brain.bolsa.dto.EnvelopeBolsaRequest;
import br.com.brain.bolsa.dto.EnvelopeConfiguracaoDto;
import br.com.brain.bolsa.dto.MatrizDescontoDto;
import br.com.brain.bolsa.dto.MatrizDescontoRequest;
import br.com.brain.bolsa.dto.PoliticaBolsaDto;
import br.com.brain.bolsa.dto.PoliticaBolsaRequest;
import br.com.brain.bolsa.dto.TipoBolsaDto;
import br.com.brain.bolsa.dto.TipoBolsaRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Configuracao do orcamento de bolsa.
 *
 * Fica sob /bolsas/configuracao, e nao solto em /bolsas, porque a autorizacao e
 * diferente: calcular teto e operacao de quem matricula; mexer na matriz e no
 * envelope decide quanto a escola deixa de arrecadar no ano. Ver
 * SecurityConfigurations.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("bolsas/configuracao")
public class BolsaConfiguracaoController {

    private final BolsaConfiguracaoService service;

    // ----------------------------------------------------------------- politica

    @PostMapping("/politicas")
    public ResponseEntity<PoliticaBolsaDto> criarPolitica(@RequestBody @Valid PoliticaBolsaRequest pedido) {
        return ResponseEntity.ok(service.criarPolitica(pedido));
    }

    @PutMapping("/politicas/{id}")
    public ResponseEntity<PoliticaBolsaDto> atualizarPolitica(
            @PathVariable Long id, @RequestBody @Valid PoliticaBolsaRequest pedido) {
        return ResponseEntity.ok(service.atualizarPolitica(id, pedido));
    }

    @GetMapping("/politicas")
    public ResponseEntity<List<PoliticaBolsaDto>> listarPoliticas() {
        return ResponseEntity.ok(service.listarPoliticas());
    }

    /** Pelo ano letivo, que e como a tela de matricula pergunta. */
    @GetMapping("/politicas/ano/{anoLetivo}")
    public ResponseEntity<PoliticaBolsaDto> politicaDoAno(@PathVariable Integer anoLetivo) {
        return ResponseEntity.ok(service.buscarPoliticaDoAno(anoLetivo));
    }

    // -------------------------------------------------------------------- tipos

    @PostMapping("/tipos")
    public ResponseEntity<TipoBolsaDto> criarTipo(@RequestBody @Valid TipoBolsaRequest pedido) {
        return ResponseEntity.ok(service.criarTipo(pedido));
    }

    @PutMapping("/tipos/{id}")
    public ResponseEntity<TipoBolsaDto> atualizarTipo(
            @PathVariable Long id, @RequestBody @Valid TipoBolsaRequest pedido) {
        return ResponseEntity.ok(service.atualizarTipo(id, pedido));
    }

    /** Inclui inativos: a tela de configuracao precisa ver o que foi desativado. */
    @GetMapping("/tipos")
    public ResponseEntity<List<TipoBolsaDto>> listarTipos() {
        return ResponseEntity.ok(service.listarTipos());
    }

    // ------------------------------------------------------------------- matriz

    @PostMapping("/matrizes")
    public ResponseEntity<MatrizDescontoDto> criarMatriz(@RequestBody @Valid MatrizDescontoRequest pedido) {
        return ResponseEntity.ok(service.criarMatriz(pedido));
    }

    /**
     * So enquanto a regra nao entrou em vigor. Depois disso a edicao reescreveria
     * propostas ja calculadas, e o caminho e /substituir.
     */
    @PutMapping("/matrizes/{id}")
    public ResponseEntity<MatrizDescontoDto> atualizarMatriz(
            @PathVariable Long id, @RequestBody @Valid MatrizDescontoRequest pedido) {
        return ResponseEntity.ok(service.atualizarMatriz(id, pedido));
    }

    /**
     * Encerra a regra atual e abre a nova numa transacao, preservando o passado:
     * proposta de marco continua sendo avaliada pela regra de marco.
     */
    @PostMapping("/matrizes/{id}/substituir")
    public ResponseEntity<MatrizDescontoDto> substituirMatriz(
            @PathVariable Long id, @RequestBody @Valid MatrizDescontoRequest pedido) {
        return ResponseEntity.ok(service.substituirMatriz(id, pedido));
    }

    @GetMapping("/politicas/{politicaId}/matrizes")
    public ResponseEntity<List<MatrizDescontoDto>> listarMatrizes(@PathVariable Long politicaId) {
        return ResponseEntity.ok(service.listarMatrizes(politicaId));
    }

    // ------------------------------------------------------------------ alcadas

    /** Upsert por perfil: cadastrar o mesmo perfil duas vezes ajusta, nao duplica. */
    @PutMapping("/alcadas")
    public ResponseEntity<AlcadaDescontoDto> definirAlcada(@RequestBody @Valid AlcadaDescontoRequest pedido) {
        return ResponseEntity.ok(service.definirAlcada(pedido));
    }

    @DeleteMapping("/alcadas/{id}")
    public ResponseEntity<Void> excluirAlcada(@PathVariable Long id) {
        service.excluirAlcada(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/politicas/{politicaId}/alcadas")
    public ResponseEntity<List<AlcadaDescontoDto>> listarAlcadas(@PathVariable Long politicaId) {
        return ResponseEntity.ok(service.listarAlcadas(politicaId));
    }

    // ---------------------------------------------------------------- envelopes

    @PostMapping("/envelopes")
    public ResponseEntity<EnvelopeConfiguracaoDto> criarEnvelope(
            @RequestBody @Valid EnvelopeBolsaRequest pedido) {
        return ResponseEntity.ok(service.criarEnvelope(pedido));
    }

    @PutMapping("/envelopes/{id}")
    public ResponseEntity<EnvelopeConfiguracaoDto> atualizarEnvelope(
            @PathVariable Long id, @RequestBody @Valid EnvelopeBolsaRequest pedido) {
        return ResponseEntity.ok(service.atualizarEnvelope(id, pedido));
    }

    /**
     * Desativar e o caminho normal de tirar do ar: para de restringir concessao
     * nova e continua explicando a renuncia que ja passou por ele.
     */
    @PutMapping("/envelopes/{id}/desativar")
    public ResponseEntity<EnvelopeConfiguracaoDto> desativarEnvelope(@PathVariable Long id) {
        return ResponseEntity.ok(service.alternarEnvelope(id, false));
    }

    @PutMapping("/envelopes/{id}/reativar")
    public ResponseEntity<EnvelopeConfiguracaoDto> reativarEnvelope(@PathVariable Long id) {
        return ResponseEntity.ok(service.alternarEnvelope(id, true));
    }

    /** Só funciona em envelope que nunca foi usado; com movimento, desative. */
    @DeleteMapping("/envelopes/{id}")
    public ResponseEntity<Void> excluirEnvelope(@PathVariable Long id) {
        service.excluirEnvelope(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/politicas/{politicaId}/envelopes")
    public ResponseEntity<List<EnvelopeConfiguracaoDto>> listarEnvelopes(@PathVariable Long politicaId) {
        return ResponseEntity.ok(service.listarEnvelopes(politicaId));
    }

    /**
     * Cache do envelope contra a soma do razao.
     *
     * reservado/comprometido sao cache; a verdade e movimentos_envelope. Cache que
     * divergiu nao da erro nenhum -- so entrega relatorio de renuncia errado no
     * fim do ano. Vale rodar depois de qualquer correcao em producao.
     */
    @GetMapping("/politicas/{politicaId}/conciliacao")
    public ResponseEntity<List<ConciliacaoEnvelopeDto>> conciliar(@PathVariable Long politicaId) {
        return ResponseEntity.ok(service.conciliar(politicaId));
    }
}
