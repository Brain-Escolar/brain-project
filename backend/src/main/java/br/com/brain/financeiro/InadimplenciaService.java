package br.com.brain.financeiro;

import br.com.brain.contrato.TituloRepository;
import br.com.brain.enums.FaixaAging;
import br.com.brain.financeiro.dto.FaixaResumoDto;
import br.com.brain.financeiro.dto.InadimplenciaDto;
import br.com.brain.financeiro.dto.InadimplenciaLinhaDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashSet;

/**
 * Inadimplencia com aging.
 *
 * Uma consulta so, e a classificacao em memoria. Poderia ser GROUP BY no banco,
 * e de proposito nao e: as faixas sao calculadas a partir da data de referencia,
 * que o chamador escolhe -- a secretaria olha hoje, a diretoria reve o fechamento
 * do mes passado. Com CASE WHEN em SQL a mesma regra passaria a existir em dois
 * lugares (aqui e na tela do responsavel), e um dia divergiriam. FaixaAging.de()
 * e o unico lugar que decide.
 *
 * O volume cabe: uma escola de 500 alunos com 12 parcelas tem 6 mil titulos no
 * pior momento do ano, e o filtro de ano letivo corta para o ano corrente. Se um
 * dia nao couber, o sinal sera claro, e entao vale o GROUP BY -- com a regra
 * ainda num lugar so.
 */
@Service
@RequiredArgsConstructor
public class InadimplenciaService {

    private static final int ESCALA = 2;

    private final TituloRepository tituloRepository;

    /**
     * @param unidadeId  opcional; nulo traz todas as unidades
     * @param anoLetivo  opcional; nulo traz todos os anos
     * @param referencia opcional; nulo usa hoje
     */
    @Transactional(readOnly = true)
    public InadimplenciaDto apurar(Long unidadeId, Integer anoLetivo, LocalDate referencia) {
        var data = referencia == null ? LocalDate.now() : referencia;
        var abertos = tituloRepository.buscarAbertosParaAging(unidadeId, anoLetivo);

        var quantidadePorFaixa = new EnumMap<FaixaAging, Integer>(FaixaAging.class);
        var valorPorFaixa = new EnumMap<FaixaAging, BigDecimal>(FaixaAging.class);
        for (var faixa : FaixaAging.values()) {
            quantidadePorFaixa.put(faixa, 0);
            valorPorFaixa.put(faixa, BigDecimal.ZERO);
        }

        var linhas = new ArrayList<InadimplenciaLinhaDto>();
        var alunosEmAtraso = new HashSet<Long>();
        var carteira = BigDecimal.ZERO;
        var emAtraso = BigDecimal.ZERO;

        for (var titulo : abertos) {
            var linha = InadimplenciaLinhaDto.de(titulo, data);
            var faixa = linha.faixa();

            carteira = carteira.add(linha.valorLiquido());
            quantidadePorFaixa.merge(faixa, 1, Integer::sum);
            valorPorFaixa.merge(faixa, linha.valorLiquido(), BigDecimal::add);

            if (faixa != FaixaAging.A_VENCER) {
                emAtraso = emAtraso.add(linha.valorLiquido());
                linhas.add(linha);
                if (linha.alunoId() != null) {
                    alunosEmAtraso.add(linha.alunoId());
                }
            }
        }

        var aVencer = valorPorFaixa.get(FaixaAging.A_VENCER);
        var faixas = new ArrayList<FaixaResumoDto>(FaixaAging.values().length);
        for (var faixa : FaixaAging.values()) {
            faixas.add(new FaixaResumoDto(
                    faixa,
                    faixa.getRotulo(),
                    quantidadePorFaixa.get(faixa),
                    valorPorFaixa.get(faixa),
                    percentual(valorPorFaixa.get(faixa), carteira)));
        }

        return new InadimplenciaDto(
                data,
                unidadeId,
                anoLetivo,
                carteira,
                emAtraso,
                aVencer,
                percentual(emAtraso, carteira),
                linhas.size(),
                alunosEmAtraso.size(),
                faixas,
                linhas);
    }

    /**
     * Carteira zerada devolve 0, e nao erro: comeco de ano letivo, antes de
     * qualquer matricula efetivada, e um estado normal -- e a tela tem de abrir.
     */
    private BigDecimal percentual(BigDecimal parte, BigDecimal total) {
        if (total.signum() == 0) {
            return BigDecimal.ZERO.setScale(ESCALA);
        }
        return parte.multiply(BigDecimal.valueOf(100))
                .divide(total, ESCALA, RoundingMode.HALF_UP);
    }
}
