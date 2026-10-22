package br.com.brain.responsavel.portal;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.contrato.Titulo;
import br.com.brain.contrato.TituloRepository;
import br.com.brain.enums.SituacaoParcela;
import br.com.brain.enums.StatusTitulo;
import br.com.brain.financeiro.Pagamento;
import br.com.brain.financeiro.PagamentoRepository;
import br.com.brain.responsavel.portal.dto.CarneResponsavelDto;
import br.com.brain.responsavel.portal.dto.ParcelaPortalDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * O financeiro do portal do responsavel: o carne.
 *
 * Separado de ResponsavelPortalService, que ja orquestra onze servicos, porque
 * esta e a primeira tela do portal que fala de dinheiro -- e dinheiro tem regra
 * propria: so quem a secretaria marcou como responsavel financeiro ve, e o que se
 * ve e o que ESTE responsavel paga, nao a conta do aluno.
 *
 * A distincao importa quando os pais sao separados e a conta e rateada: cada um
 * ve a sua metade, e nenhum dos dois ve quanto o outro paga. Isso sai de graca do
 * modelo -- o titulo pertence a um responsavel -- mas so se a consulta partir do
 * responsavel logado, que e o que acontece aqui.
 */
@Service
@RequiredArgsConstructor
public class ResponsavelFinanceiroService {

    private final VinculoResponsavelGuard guard;
    private final TituloRepository tituloRepository;
    private final PagamentoRepository pagamentoRepository;

    /**
     * @param anoLetivo opcional; nulo traz todos os anos (historico)
     */
    @Transactional(readOnly = true)
    public CarneResponsavelDto carne(DadosAutenticacao usuario, Integer anoLetivo) {
        var responsavel = guard.resolverResponsavelFinanceiro(usuario);
        var hoje = LocalDate.now();

        var titulos = tituloRepository.buscarDoResponsavelComContexto(responsavel.getId(), anoLetivo);
        var pagamentosPorTitulo = pagamentosVivosPorTitulo(titulos);

        var parcelas = new ArrayList<ParcelaPortalDto>(titulos.size());
        var totalContratado = BigDecimal.ZERO;
        var totalPago = BigDecimal.ZERO;
        var totalAberto = BigDecimal.ZERO;
        var totalEmAtraso = BigDecimal.ZERO;
        var totalDeBolsa = BigDecimal.ZERO;
        var parcelasEmAtraso = 0;
        LocalDate proximoVencimento = null;
        var valorDoProximo = BigDecimal.ZERO;

        for (var titulo : titulos) {
            var pagamento = pagamentosPorTitulo.get(titulo.getId());
            var parcela = montarParcela(titulo, pagamento, hoje);
            parcelas.add(parcela);

            // Linhas que nao valem (cancelada, substituida, estornada) ficam na
            // lista e fora das somas -- ver o comentario do DTO.
            if (!contaNosTotais(titulo.getStatus())) {
                continue;
            }

            totalContratado = totalContratado.add(titulo.getValorLiquido());
            totalDeBolsa = totalDeBolsa.add(titulo.getValorDesconto());

            if (titulo.getStatus() == StatusTitulo.PAGO) {
                totalPago = totalPago.add(titulo.getValorLiquido());
                continue;
            }

            totalAberto = totalAberto.add(titulo.getValorLiquido());

            if (parcela.situacao() == SituacaoParcela.EM_ATRASO) {
                totalEmAtraso = totalEmAtraso.add(titulo.getValorLiquido());
                parcelasEmAtraso++;
                continue;
            }

            // Os titulos vem ordenados por vencimento, entao o primeiro aberto que
            // ainda nao venceu e o proximo. Varias parcelas podem cair no mesmo
            // dia (rateio, ou mensalidade mais material), e nesse caso o valor do
            // proximo vencimento e a soma delas -- e isso que o pai vai pagar.
            if (proximoVencimento == null) {
                proximoVencimento = titulo.getVencimento();
                valorDoProximo = titulo.getValorLiquido();
            } else if (proximoVencimento.isEqual(titulo.getVencimento())) {
                valorDoProximo = valorDoProximo.add(titulo.getValorLiquido());
            }
        }

        return new CarneResponsavelDto(
                anoLetivo,
                totalContratado,
                totalPago,
                totalAberto,
                totalEmAtraso,
                totalDeBolsa,
                proximoVencimento,
                proximoVencimento == null ? BigDecimal.ZERO : valorDoProximo,
                parcelasEmAtraso,
                parcelas);
    }

    // ------------------------------------------------------------------ apoio

    private boolean contaNosTotais(StatusTitulo status) {
        return status == StatusTitulo.ABERTO || status == StatusTitulo.PAGO;
    }

    private Map<Long, Pagamento> pagamentosVivosPorTitulo(List<Titulo> titulos) {
        if (titulos.isEmpty()) {
            return Map.of();
        }
        var ids = titulos.stream().map(Titulo::getId).toList();
        return pagamentoRepository.buscarVivosPorTitulos(ids).stream()
                .collect(Collectors.toMap(
                        p -> p.getTitulo().getId(),
                        Function.identity(),
                        // Nao deveria existir mais de uma baixa viva por titulo (a
                        // baixa exige titulo ABERTO e trava a linha). Se existir,
                        // a tela mostra uma em vez de estourar, e o problema
                        // aparece na conferencia de caixa, que e onde se resolve.
                        (a, b) -> a));
    }

    private ParcelaPortalDto montarParcela(Titulo titulo, Pagamento pagamento, LocalDate hoje) {
        var contrato = titulo.getContrato();
        var aluno = contrato.getMatricula().getAluno();
        var dadosDoAluno = aluno.getDadosPessoais();

        return new ParcelaPortalDto(
                titulo.getId(),
                aluno.getId(),
                dadosDoAluno == null ? null : dadosDoAluno.getNome(),
                contrato.getNumero(),
                titulo.getNumeroParcela(),
                contrato.getQtdParcelas(),
                titulo.getCompetencia(),
                titulo.getVencimento(),
                titulo.getDescricao(),
                titulo.getValorBruto(),
                titulo.getValorDesconto(),
                titulo.getValorLiquido(),
                titulo.getStatus(),
                SituacaoParcela.de(titulo.getStatus(), titulo.getVencimento(), hoje),
                ChronoUnit.DAYS.between(titulo.getVencimento(), hoje),
                pagamento == null ? null : pagamento.getDataPagamento(),
                pagamento == null ? null : pagamento.getForma());
    }
}
