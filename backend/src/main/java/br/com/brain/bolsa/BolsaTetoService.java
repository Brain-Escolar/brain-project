package br.com.brain.bolsa;

import br.com.brain.bolsa.dto.EnvelopeSaldoDto;
import br.com.brain.bolsa.dto.TetoConcessaoDto;
import br.com.brain.enums.BaseCalculoEnvelope;
import br.com.brain.enums.NaturezaEnvelope;
import br.com.brain.enums.NaturezaProduto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.enums.Turno;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.perfil.Perfil;
import br.com.brain.produto.Produto;
import br.com.brain.produto.ProdutoPreco;
import br.com.brain.produto.ProdutoPrecoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Quanto de bolsa o funcionario pode conceder a este aluno.
 *
 * Sao tres limites independentes e vale o MENOR:
 *
 *   1. matriz  - ate quanto este tipo de bolsa chega nesta serie/unidade
 *   2. alcada  - ate quanto o perfil de quem esta na tela pode conceder
 *   3. envelope- quanto o orcamento de bolsa ainda comporta
 *
 * A tela mostra percentual porque e assim que o funcionario pensa, mas a conta
 * e feita em reais: percentual nao soma entre series, ja que 20% de uma
 * mensalidade de R$ 1.200 e 20% de uma de R$ 2.500 sao dinheiros diferentes.
 */
@Service
@RequiredArgsConstructor
public class BolsaTetoService {

    private static final BigDecimal CEM = new BigDecimal("100");
    private static final int ESCALA = 2;

    /**
     * Teto e limite: arredondar para cima concederia um centavo a mais do que o
     * orcamento comporta. Sempre para baixo.
     */
    private static final RoundingMode ARREDONDAMENTO = RoundingMode.DOWN;

    private final PoliticaBolsaRepository politicaRepository;
    private final TipoBolsaRepository tipoBolsaRepository;
    private final MatrizDescontoRepository matrizRepository;
    private final AlcadaDescontoRepository alcadaRepository;
    private final EnvelopeBolsaRepository envelopeRepository;
    private final ProdutoPrecoRepository precoRepository;

    /**
     * @param dataProposta data em que a proposta esta sendo feita, nao "hoje": a
     *                     matriz do ano letivo seguinte comeca a valer durante a
     *                     campanha, e uma proposta revista depois precisa ser
     *                     avaliada pela regra que valia quando foi feita.
     */
    public TetoConcessaoDto calcular(
            Integer anoLetivo,
            Long tipoBolsaId,
            Long unidadeId,
            Long serieId,
            Turno turno,
            Integer qtdParcelas,
            LocalDate dataProposta) {

        var politica = politicaRepository.findByAnoLetivo(anoLetivo)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Política de bolsa do ano letivo", anoLetivo));

        var tipoBolsa = tipoBolsaRepository.buscarComProdutos(tipoBolsaId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Tipo de bolsa", tipoBolsaId));

        if (Boolean.FALSE.equals(tipoBolsa.getAtivo())) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("O tipo de bolsa '" + tipoBolsa.getNome() + "' está inativo.");
        }

        var valorCheioAnual = valorCheioAnual(tipoBolsa, anoLetivo, unidadeId, serieId, turno,
                qtdParcelas, dataProposta);

        var tetoMatriz = tetoMatriz(politica.getId(), tipoBolsaId, unidadeId, serieId, dataProposta);
        var tetoAlcada = tetoAlcada(politica.getId());

        var envelopes = envelopeRepository.buscarDoEscopo(
                politica.getId(), NaturezaEnvelope.LIMITE_MAXIMO, unidadeId, serieId, tipoBolsaId);

        var saldos = new ArrayList<EnvelopeSaldoDto>();
        for (var envelope : envelopes) {
            saldos.add(saldoDe(envelope, anoLetivo, valorCheioAnual));
        }

        var restritivo = saldos.stream()
                .min(Comparator.comparing(EnvelopeSaldoDto::percentualDisponivel))
                .orElse(null);

        // Sem envelope de teto, o orcamento nao restringe: "sem teto adicional"
        // e um cenario valido, nao uma configuracao faltando.
        var tetoEnvelope = restritivo == null ? CEM : restritivo.percentualDisponivel();

        var podeConceder = tetoMatriz.min(tetoAlcada).min(tetoEnvelope);
        var limite = limiteAtingido(podeConceder, tetoMatriz, tetoAlcada);

        return new TetoConcessaoDto(
                anoLetivo,
                tipoBolsa.getNome(),
                valorCheioAnual,
                tetoMatriz,
                tetoAlcada,
                tetoEnvelope,
                podeConceder,
                percentualDe(valorCheioAnual, podeConceder),
                limite,
                // so aponta o envelope como culpado quando ele e mesmo o menor
                limite == TetoConcessaoDto.LimiteAtingido.ENVELOPE ? restritivo : null,
                saldos);
    }

    /**
     * Anuidade cheia dos itens sobre os quais ESTA bolsa incide. Produto
     * RECORRENTE conta uma vez por parcela; UNICO e EVENTUAL contam uma vez.
     */
    private BigDecimal valorCheioAnual(
            TipoBolsa tipoBolsa, Integer anoLetivo, Long unidadeId, Long serieId,
            Turno turno, Integer qtdParcelas, LocalDate data) {

        var produtosElegiveis = tipoBolsa.getProdutos().stream()
                .filter(p -> Boolean.TRUE.equals(p.getAtivo()))
                .filter(p -> Boolean.TRUE.equals(p.getPermiteBolsa()))
                .toList();

        if (produtosElegiveis.isEmpty()) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Nenhum produto está marcado como elegível à bolsa '" + tipoBolsa.getNome()
                            + "'. Configure em tipos_bolsa_produtos antes de conceder.");
        }

        var precos = precoRepository.buscarVigentes(
                produtosElegiveis.stream().map(Produto::getId).toList(),
                anoLetivo, unidadeId, serieId, turno, data);

        var total = BigDecimal.ZERO;
        for (var produto : produtosElegiveis) {
            var preco = precoMaisEspecifico(precos, produto.getId());
            if (preco == null) {
                continue;
            }
            var vezes = produto.getNatureza() == NaturezaProduto.RECORRENTE
                    ? BigDecimal.valueOf(qtdParcelas)
                    : BigDecimal.ONE;
            total = total.add(preco.getValor().multiply(vezes));
        }

        if (total.signum() <= 0) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Não há preço vigente cadastrado para esta série/turno no ano letivo "
                            + anoLetivo + ". Sem preço cheio não há como calcular bolsa.");
        }
        return total.setScale(ESCALA, ARREDONDAMENTO);
    }

    /** Entre as linhas que casam, a que preencheu mais dimensoes vence. */
    private ProdutoPreco precoMaisEspecifico(List<ProdutoPreco> precos, Long produtoId) {
        return precos.stream()
                .filter(p -> p.getModalidade().getProduto().getId().equals(produtoId))
                .max(Comparator.comparingInt(ProdutoPreco::especificidade)
                        .thenComparing(ProdutoPreco::getVigenciaInicio))
                .orElse(null);
    }

    /** Sem regra na matriz, nao se concede nada: ausencia nao e permissao. */
    private BigDecimal tetoMatriz(Long politicaId, Long tipoBolsaId, Long unidadeId,
            Long serieId, LocalDate data) {
        return matrizRepository
                .buscarVigentes(politicaId, tipoBolsaId, unidadeId, serieId, data).stream()
                .max(Comparator.comparingInt(MatrizDesconto::especificidade)
                        .thenComparing(MatrizDesconto::getVigenciaInicio))
                .map(MatrizDesconto::getPercentualMax)
                .orElse(BigDecimal.ZERO)
                .setScale(ESCALA, ARREDONDAMENTO);
    }

    /**
     * Quem acumula perfis fica com a maior alcada: e a mesma regra que o
     * frontend ja aplica ("as capacidades dos demais continuam valendo pela
     * lista completa").
     */
    private BigDecimal tetoAlcada(Long politicaId) {
        var perfis = perfisDoUsuario();
        if (perfis.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return alcadaRepository.buscarPorPerfis(politicaId, perfis).stream()
                .map(AlcadaDesconto::getPercentualMax)
                .max(Comparator.naturalOrder())
                .orElse(BigDecimal.ZERO)
                .setScale(ESCALA, ARREDONDAMENTO);
    }

    /**
     * O perfil vem do token, nunca da requisicao: se viesse por parametro,
     * qualquer um pediria o teto de diretor.
     *
     * Visivel no pacote porque o BolsaConcessaoService precisa da MESMA leitura
     * de perfil para decidir quem pode exceder envelope. Duas leituras
     * diferentes seria uma para consultar e outra para gravar -- e a que grava
     * divergiria em algum momento.
     */
    Set<PerfilNome> perfisDoUsuario() {
        var autenticacao = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacao == null || !autenticacao.isAuthenticated()) {
            return Set.of();
        }
        return autenticacao.getAuthorities().stream()
                .filter(Perfil.class::isInstance)
                .map(Perfil.class::cast)
                .map(Perfil::getNome)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private EnvelopeSaldoDto saldoDe(EnvelopeBolsa envelope, Integer anoLetivo, BigDecimal valorCheioAnual) {
        BigDecimal teto = null;
        BigDecimal saldo = null;
        BigDecimal saldoEquiv = null;
        BigDecimal percentualDisponivel;

        switch (envelope.getUnidadeMedida()) {
            case SEM_LIMITE -> percentualDisponivel = CEM;

            case QUANTIDADE_EQUIVALENTE -> {
                saldoEquiv = envelope.getQuantidadeLimite().subtract(envelope.consumidoEquivalente());
                // 1 bolsa equivalente = 100% de um aluno
                percentualDisponivel = limitarACem(naoNegativo(saldoEquiv).multiply(CEM));
            }

            case VALOR_ABSOLUTO -> {
                teto = envelope.getValorLimite();
                saldo = teto.subtract(envelope.consumido());
                percentualDisponivel = percentualQueCabe(saldo, valorCheioAnual);
            }

            case PERCENTUAL_RECEITA -> {
                var base = baseDeReceita(envelope, anoLetivo);
                teto = base.multiply(envelope.getPercentualLimite())
                        .divide(CEM, ESCALA, ARREDONDAMENTO);
                saldo = teto.subtract(envelope.consumido());
                percentualDisponivel = percentualQueCabe(saldo, valorCheioAnual);
            }

            default -> percentualDisponivel = CEM;
        }

        return new EnvelopeSaldoDto(
                envelope.getId(),
                envelope.getNome(),
                envelope.getNatureza(),
                envelope.getUnidadeMedida(),
                teto,
                envelope.consumido(),
                saldo,
                envelope.getQuantidadeLimite(),
                envelope.consumidoEquivalente(),
                saldoEquiv,
                percentualDisponivel,
                envelope.getPermiteExcedente());
    }

    /**
     * O denominador do teto percentual se move: RECEITA_REALIZADA cresce a cada
     * matricula nova a preco cheio. Por isso e recalculado a cada consulta e
     * nunca fica em cache.
     *
     * RECEITA_PROJETADA existe porque a realizada vale quase zero no inicio da
     * campanha, e ai ninguem conseguiria conceder bolsa nenhuma.
     */
    private BigDecimal baseDeReceita(EnvelopeBolsa envelope, Integer anoLetivo) {
        if (envelope.getBaseCalculo() == BaseCalculoEnvelope.RECEITA_PROJETADA) {
            return envelope.getReceitaProjetada() == null ? BigDecimal.ZERO : envelope.getReceitaProjetada();
        }
        var realizada = envelopeRepository.somarReceitaRealizada(
                anoLetivo,
                envelope.getUnidade() == null ? null : envelope.getUnidade().getId(),
                envelope.getSerie() == null ? null : envelope.getSerie().getId());
        return realizada == null ? BigDecimal.ZERO : realizada;
    }

    private BigDecimal percentualQueCabe(BigDecimal saldo, BigDecimal valorCheioAnual) {
        return limitarACem(naoNegativo(saldo)
                .multiply(CEM)
                .divide(valorCheioAnual, ESCALA, ARREDONDAMENTO));
    }

    private BigDecimal percentualDe(BigDecimal valor, BigDecimal percentual) {
        return valor.multiply(percentual).divide(CEM, ESCALA, ARREDONDAMENTO);
    }

    private BigDecimal naoNegativo(BigDecimal valor) {
        return valor.signum() < 0 ? BigDecimal.ZERO : valor;
    }

    private BigDecimal limitarACem(BigDecimal percentual) {
        return percentual.min(CEM).setScale(ESCALA, ARREDONDAMENTO);
    }

    private TetoConcessaoDto.LimiteAtingido limiteAtingido(
            BigDecimal menor, BigDecimal tetoMatriz, BigDecimal tetoAlcada) {
        if (menor.compareTo(tetoMatriz) == 0) {
            return TetoConcessaoDto.LimiteAtingido.MATRIZ;
        }
        if (menor.compareTo(tetoAlcada) == 0) {
            return TetoConcessaoDto.LimiteAtingido.ALCADA;
        }
        return TetoConcessaoDto.LimiteAtingido.ENVELOPE;
    }
}
