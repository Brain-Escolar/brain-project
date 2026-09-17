package br.com.brain.bolsa;

import br.com.brain.bolsa.dto.TetoConcessaoDto;
import br.com.brain.bolsa.dto.TipoBolsaDto;
import br.com.brain.enums.Turno;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("bolsas")
public class BolsaController {

    private final BolsaTetoService tetoService;
    private final TipoBolsaRepository tipoBolsaRepository;

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
}
