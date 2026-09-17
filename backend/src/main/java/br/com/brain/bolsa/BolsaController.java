package br.com.brain.bolsa;

import br.com.brain.bolsa.dto.ConcessaoBolsaDto;
import br.com.brain.bolsa.dto.ReservarBolsaRequest;
import br.com.brain.bolsa.dto.TetoConcessaoDto;
import br.com.brain.bolsa.dto.TipoBolsaDto;
import br.com.brain.enums.StatusSimulacaoFinanceira;
import br.com.brain.enums.Turno;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("bolsas")
public class BolsaController {

    private final BolsaTetoService tetoService;
    private final BolsaConcessaoService concessaoService;
    private final TipoBolsaRepository tipoBolsaRepository;
    private final ConcessaoBolsaRepository concessaoRepository;

    /** Tipos de bolsa ativos, para o seletor da tela de matricula. */
    @GetMapping("/tipos")
    public ResponseEntity<List<TipoBolsaDto>> tipos() {
        return ResponseEntity.ok(
                tipoBolsaRepository.findByAtivoTrueOrderByNomeAsc().stream()
                        .map(TipoBolsaDto::new)
                        .toList());
    }

    /**
     * Quanto de bolsa pode ser concedido a este aluno.
     *
     * O perfil NAO vem por parametro: e lido do token. Se viesse da requisicao,
     * qualquer um pediria o teto de diretor.
     */
    @GetMapping("/teto")
    public ResponseEntity<TetoConcessaoDto> teto(
            @RequestParam("anoLetivo") Integer anoLetivo,
            @RequestParam("tipoBolsaId") Long tipoBolsaId,
            @RequestParam("unidadeId") Long unidadeId,
            @RequestParam("serieId") Long serieId,
            @RequestParam(value = "turno", required = false) Turno turno,
            @RequestParam(value = "qtdParcelas", defaultValue = "12") Integer qtdParcelas,
            @RequestParam(value = "dataProposta", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataProposta) {

        var data = dataProposta == null ? LocalDate.now() : dataProposta;

        return ResponseEntity.ok(tetoService.calcular(
                anoLetivo, tipoBolsaId, unidadeId, serieId, turno, qtdParcelas, data));
    }

    /** Concede a bolsa a uma proposta e segura o orcamento correspondente. */
    @PostMapping("/reservar")
    public ResponseEntity<ConcessaoBolsaDto> reservar(@RequestBody @Valid ReservarBolsaRequest pedido) {
        return ResponseEntity.ok(concessaoService.reservar(pedido));
    }

    /**
     * Matricula efetivada: o que estava reservado vira comprometido.
     *
     * Chamado pela efetivacao da matricula, nao pela tela -- fica exposto
     * porque a proxima fatia (contrato e titulos) e quem vai chamar, e ate la a
     * transicao precisa ser testavel de fora.
     */
    @PostMapping("/simulacoes/{simulacaoId}/comprometer")
    public ResponseEntity<List<ConcessaoBolsaDto>> comprometer(
            @PathVariable Long simulacaoId,
            @RequestParam("contratoId") Long contratoId) {
        return ResponseEntity.ok(concessaoService.comprometer(simulacaoId, contratoId));
    }

    /** Lead perdido ou proposta refeita: devolve o orcamento ao bolo. */
    @PostMapping("/simulacoes/{simulacaoId}/liberar")
    public ResponseEntity<List<ConcessaoBolsaDto>> liberar(
            @PathVariable Long simulacaoId,
            @RequestParam(value = "motivo", required = false) String motivo) {
        return ResponseEntity.ok(concessaoService.liberar(
                simulacaoId, StatusSimulacaoFinanceira.PERDIDA, motivo));
    }

    /**
     * Devolve o orcamento de reservas vencidas, no schema de quem chamou.
     *
     * O BolsaReservaExpiracaoScheduler ja faz isso de madrugada para todas as
     * escolas. Este endpoint existe para rodar a mao -- depois de corrigir uma
     * politica, por exemplo, sem esperar a proxima madrugada.
     */
    @PostMapping("/reservas/expirar")
    public ResponseEntity<Map<String, Integer>> expirar() {
        return ResponseEntity.ok(Map.of("liberadas", concessaoService.expirarReservasVencidas()));
    }

    /** Aluno saiu no meio do ano: devolve a parte nao realizada. */
    @PostMapping("/concessoes/{concessaoId}/encerrar")
    public ResponseEntity<ConcessaoBolsaDto> encerrar(
            @PathVariable Long concessaoId,
            @RequestParam("dataEncerramento") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataEncerramento,
            @RequestParam(value = "motivo", required = false) String motivo) {
        return ResponseEntity.ok(concessaoService.encerrar(concessaoId, dataEncerramento, motivo));
    }

    /** As bolsas de uma proposta, com o historico de status. */
    @GetMapping("/simulacoes/{simulacaoId}/concessoes")
    public ResponseEntity<List<ConcessaoBolsaDto>> concessoesDaSimulacao(@PathVariable Long simulacaoId) {
        return ResponseEntity.ok(concessaoRepository.buscarDaSimulacaoParaLeitura(simulacaoId).stream()
                .map(ConcessaoBolsaDto::new)
                .toList());
    }
}
