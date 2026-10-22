package br.com.brain.financeiro;

import br.com.brain.aluno.Aluno;
import br.com.brain.contrato.ContratoServico;
import br.com.brain.contrato.Titulo;
import br.com.brain.contrato.TituloRepository;
import br.com.brain.enums.FaixaAging;
import br.com.brain.financeiro.dto.FaixaResumoDto;
import br.com.brain.financeiro.dto.InadimplenciaDto;
import br.com.brain.matricula.Matricula;
import br.com.brain.responsavel.Responsavel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * O aging da inadimplencia.
 *
 * O repositorio e mock porque a consulta nao e o que se esta testando -- a
 * classificacao e a agregacao sao. E elas sao a parte que a diretoria vai olhar
 * para decidir coisas: 12% de inadimplencia e um numero que muda orcamento.
 *
 * Datas RELATIVAS a hoje, sempre.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("InadimplenciaService")
class InadimplenciaServiceTest {

    @Mock
    private TituloRepository tituloRepository;

    @InjectMocks
    private InadimplenciaService service;

    private Titulo titulo(long alunoId, LocalDate vencimento, String liquido) {
        var aluno = new Aluno();
        aluno.setId(alunoId);

        var matricula = new Matricula();
        matricula.setAluno(aluno);
        matricula.setAnoLetivo(LocalDate.now().getYear());

        var contrato = new ContratoServico();
        contrato.setId(1L);
        contrato.setNumero("CT-" + LocalDate.now().getYear() + "-" + alunoId);
        contrato.setMatricula(matricula);
        contrato.setQtdParcelas(12);

        var responsavel = new Responsavel();
        responsavel.setId(100 + alunoId);

        return Titulo.parcela(contrato, responsavel, vencimento.withDayOfMonth(1), 1,
                vencimento, "Parcela 1/12", new BigDecimal(liquido), BigDecimal.ZERO);
    }

    private void repositorioDevolve(List<Titulo> titulos) {
        when(tituloRepository.buscarAbertosParaAging(any(), any())).thenReturn(titulos);
    }

    @Test
    @DisplayName("carteira vazia abre a tela em vez de quebrar")
    void carteiraVazia() {
        repositorioDevolve(List.of());

        var relatorio = service.apurar(null, null, null);

        assertThat(relatorio.carteiraAberta()).isEqualByComparingTo("0");
        assertThat(relatorio.totalEmAtraso()).isEqualByComparingTo("0");
        assertThat(relatorio.percentualEmAtraso())
                .as("divisão por carteira zero não pode estourar")
                .isEqualByComparingTo("0");
        assertThat(relatorio.linhas()).isEmpty();
        assertThat(relatorio.faixas()).hasSize(FaixaAging.values().length);
        assertThat(relatorio.referencia()).isEqualTo(LocalDate.now());
    }

    /** Quem esta em dia nao entra na lista de cobranca. */
    @Test
    @DisplayName("parcela a vencer entra na carteira e não na lista de cobrança")
    void aVencerNaoViraLinha() {
        var hoje = LocalDate.now();
        repositorioDevolve(List.of(
                titulo(1L, hoje.plusDays(10), "1080.00"),
                titulo(2L, hoje.plusDays(40), "900.00"),
                titulo(3L, hoje, "500.00")));

        var relatorio = service.apurar(null, null, null);

        assertThat(relatorio.carteiraAberta()).isEqualByComparingTo("2480.00");
        assertThat(relatorio.totalAVencer()).isEqualByComparingTo("2480.00");
        assertThat(relatorio.totalEmAtraso()).isEqualByComparingTo("0");
        assertThat(relatorio.linhas()).isEmpty();
        assertThat(relatorio.alunosEmAtraso()).isZero();
        assertThat(faixa(relatorio, FaixaAging.A_VENCER).quantidadeDeParcelas()).isEqualTo(3);
    }

    @Test
    @DisplayName("cada atraso cai na sua faixa, e a soma das faixas fecha com a carteira")
    void classificaPorFaixa() {
        var hoje = LocalDate.now();
        repositorioDevolve(List.of(
                titulo(1L, hoje.plusDays(10), "1000.00"),   // a vencer
                titulo(2L, hoje.minusDays(5), "100.00"),    // ate 30
                titulo(3L, hoje.minusDays(45), "200.00"),   // 31 a 60
                titulo(4L, hoje.minusDays(75), "300.00"),   // 61 a 90
                titulo(5L, hoje.minusDays(200), "400.00")));// acima de 90

        var relatorio = service.apurar(null, null, null);

        assertThat(faixa(relatorio, FaixaAging.A_VENCER).valor()).isEqualByComparingTo("1000.00");
        assertThat(faixa(relatorio, FaixaAging.ATE_30).valor()).isEqualByComparingTo("100.00");
        assertThat(faixa(relatorio, FaixaAging.DE_31_A_60).valor()).isEqualByComparingTo("200.00");
        assertThat(faixa(relatorio, FaixaAging.DE_61_A_90).valor()).isEqualByComparingTo("300.00");
        assertThat(faixa(relatorio, FaixaAging.ACIMA_DE_90).valor()).isEqualByComparingTo("400.00");

        assertThat(relatorio.carteiraAberta()).isEqualByComparingTo("2000.00");
        assertThat(relatorio.totalEmAtraso()).isEqualByComparingTo("1000.00");
        assertThat(relatorio.parcelasEmAtraso()).isEqualTo(4);
        assertThat(relatorio.alunosEmAtraso()).isEqualTo(4);

        // A invariante que importa: nenhum titulo some nem e contado duas vezes.
        var somaDasFaixas = relatorio.faixas().stream()
                .map(f -> f.valor())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(somaDasFaixas)
                .as("a soma das faixas %s", relatorio.faixas())
                .isEqualByComparingTo(relatorio.carteiraAberta());
    }

    /**
     * Tres parcelas atrasadas do mesmo aluno sao UMA familia para ligar, nao
     * tres. A diretoria pergunta "quantos alunos", nao "quantas parcelas" -- e as
     * duas respostas existem no relatorio justamente porque sao diferentes.
     */
    @Test
    @DisplayName("conta alunos distintos, não parcelas")
    void alunosDistintos() {
        var hoje = LocalDate.now();
        repositorioDevolve(List.of(
                titulo(1L, hoje.minusDays(10), "100.00"),
                titulo(1L, hoje.minusDays(40), "100.00"),
                titulo(1L, hoje.minusDays(70), "100.00"),
                titulo(2L, hoje.minusDays(10), "100.00")));

        var relatorio = service.apurar(null, null, null);

        assertThat(relatorio.parcelasEmAtraso()).isEqualTo(4);
        assertThat(relatorio.alunosEmAtraso()).isEqualTo(2);
    }

    @Test
    @DisplayName("o percentual é do atraso sobre a carteira inteira")
    void percentual() {
        var hoje = LocalDate.now();
        repositorioDevolve(List.of(
                titulo(1L, hoje.plusDays(10), "750.00"),
                titulo(2L, hoje.minusDays(10), "250.00")));

        var relatorio = service.apurar(null, null, null);

        assertThat(relatorio.percentualEmAtraso()).isEqualByComparingTo("25.00");
        assertThat(faixa(relatorio, FaixaAging.ATE_30).percentualDaCarteira())
                .isEqualByComparingTo("25.00");
    }

    /**
     * O fechamento de um mes passado tem de dar o mesmo numero que dava naquele
     * dia. Sem o parametro de referencia, reabrir setembro em outubro mostraria
     * todo mundo 30 dias mais atrasado.
     */
    @Test
    @DisplayName("referência retroativa reclassifica as faixas")
    void referenciaRetroativa() {
        var hoje = LocalDate.now();
        repositorioDevolve(List.of(titulo(1L, hoje.minusDays(40), "100.00")));

        var hojeMesmo = service.apurar(null, null, null);
        assertThat(hojeMesmo.linhas().getFirst().faixa()).isEqualTo(FaixaAging.DE_31_A_60);
        assertThat(hojeMesmo.linhas().getFirst().diasDeAtraso()).isEqualTo(40);

        var comoEraAntes = service.apurar(null, null, hoje.minusDays(35));
        assertThat(comoEraAntes.linhas().getFirst().faixa()).isEqualTo(FaixaAging.ATE_30);
        assertThat(comoEraAntes.linhas().getFirst().diasDeAtraso()).isEqualTo(5);
        assertThat(comoEraAntes.referencia()).isEqualTo(hoje.minusDays(35));
    }

    @Test
    @DisplayName("a linha de cobrança carrega o que a secretaria precisa para ligar")
    void linhaTemContexto() {
        var hoje = LocalDate.now();
        repositorioDevolve(List.of(titulo(42L, hoje.minusDays(15), "1080.00")));

        var linha = service.apurar(null, null, null).linhas().getFirst();

        assertThat(linha.alunoId()).isEqualTo(42L);
        assertThat(linha.responsavelId()).isEqualTo(142L);
        assertThat(linha.contratoNumero()).isEqualTo("CT-" + hoje.getYear() + "-42");
        assertThat(linha.numeroParcela()).isEqualTo(1);
        assertThat(linha.diasDeAtraso()).isEqualTo(15);
        assertThat(linha.valorLiquido()).isEqualByComparingTo("1080.00");
        assertThat(linha.faixa()).isEqualTo(FaixaAging.ATE_30);
    }

    private FaixaResumoDto faixa(InadimplenciaDto relatorio, FaixaAging faixa) {
        return relatorio.faixas().stream()
                .filter(f -> f.faixa() == faixa)
                .findFirst()
                .orElseThrow(() -> new AssertionError("faixa " + faixa + " ausente no relatório"));
    }
}
