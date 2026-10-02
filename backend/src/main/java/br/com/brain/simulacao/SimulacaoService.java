package br.com.brain.simulacao;

import br.com.brain.aluno.Aluno;
import br.com.brain.crm.ProcessoMatricula;
import br.com.brain.enums.NaturezaProduto;
import br.com.brain.enums.StatusSimulacaoFinanceira;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.produto.ProdutoPreco;
import br.com.brain.produto.ProdutoPrecoRepository;
import br.com.brain.responsavel.Responsavel;
import br.com.brain.serie.Serie;
import br.com.brain.simulacao.dto.CriarSimulacaoRequest;
import br.com.brain.simulacao.dto.SimulacaoDto;
import br.com.brain.unidade.Unidade;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;

/**
 * Monta a proposta a partir do catalogo vigente.
 *
 * O preco e copiado para o item, nao apenas referenciado: se a tabela mudar em
 * outubro, a proposta feita em setembro continua valendo o que foi prometido ao
 * pai. E a mesma razao pela qual a efetivacao da matricula MATERIALIZA esta
 * simulacao em contrato, sem recalcular -- o numero que a familia viu e o
 * numero que vai no boleto.
 */
@Service
@RequiredArgsConstructor
public class SimulacaoService {

    private final SimulacaoFinanceiraRepository repository;
    private final ProdutoPrecoRepository precoRepository;
    private final EntityManager entityManager;

    @Transactional
    public SimulacaoDto criar(CriarSimulacaoRequest pedido) {
        if (pedido.processoMatriculaId() == null && pedido.alunoId() == null) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A simulação precisa estar ligada a um processo de matrícula (lead) ou a um aluno.");
        }

        var hoje = LocalDate.now();
        var precos = precoRepository.buscarVigentesDoCatalogo(
                pedido.anoLetivo(), pedido.unidadeId(), pedido.serieId(), pedido.turno(), hoje);

        if (precos.isEmpty()) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "Não há preço vigente cadastrado para esta série/turno no ano letivo "
                            + pedido.anoLetivo() + ". Cadastre a tabela de preços antes de simular.");
        }

        var simulacao = new SimulacaoFinanceira();
        simulacao.setProcessoMatricula(referencia(ProcessoMatricula.class, pedido.processoMatriculaId()));
        simulacao.setAluno(referencia(Aluno.class, pedido.alunoId()));
        simulacao.setResponsavel(referencia(Responsavel.class, pedido.responsavelId()));
        simulacao.setAnoLetivo(pedido.anoLetivo());
        simulacao.setUnidade(entityManager.getReference(Unidade.class, pedido.unidadeId()));
        simulacao.setSerie(entityManager.getReference(Serie.class, pedido.serieId()));
        simulacao.setTurno(pedido.turno());
        simulacao.setQtdParcelas(pedido.qtdParcelas());
        simulacao.setDiaVencimento(pedido.diaVencimento());
        simulacao.setStatus(StatusSimulacaoFinanceira.RASCUNHO);

        var bruto = BigDecimal.ZERO;
        for (var preco : maisEspecificoPorModalidade(precos)) {
            var produto = preco.getModalidade().getProduto();
            var recorrente = produto.getNatureza() == NaturezaProduto.RECORRENTE;

            var item = new SimulacaoItem();
            item.setModalidade(preco.getModalidade());
            item.setPreco(preco);
            item.setDescricao(produto.getNome() + " — " + preco.getModalidade().getModalidade());
            item.setValorUnitario(preco.getValor());
            // Recorrente conta uma vez por parcela; unico e eventual, uma vez so.
            item.setQuantidade(recorrente ? pedido.qtdParcelas() : 1);
            item.setElegivelBolsa(Boolean.TRUE.equals(produto.getPermiteBolsa()));

            simulacao.adicionarItem(item);
            bruto = bruto.add(item.total());
        }

        simulacao.setValorBruto(bruto);
        // Ainda sem bolsa: quem concede e o BolsaConcessaoService, e e ele que
        // mexe no desconto daqui em diante.
        simulacao.aplicarDesconto(BigDecimal.ZERO);

        return new SimulacaoDto(repository.save(simulacao));
    }

    @Transactional(readOnly = true)
    public SimulacaoDto buscar(Long id) {
        return new SimulacaoDto(repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException
                        .para("Simulação financeira", id)));
    }

    @Transactional(readOnly = true)
    public List<SimulacaoDto> doProcesso(Long processoMatriculaId) {
        return repository.findByProcessoMatriculaIdOrderByIdDesc(processoMatriculaId).stream()
                .map(SimulacaoDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SimulacaoDto> doAluno(Long alunoId) {
        return repository.findByAlunoIdOrderByIdDesc(alunoId).stream()
                .map(SimulacaoDto::new)
                .toList();
    }

    /**
     * Uma linha por modalidade, a mais especifica.
     *
     * A consulta traz tudo que CASA com a dimensao -- inclusive a regra geral
     * com serie nula. Sem este desempate, um aluno do 6o ano com preco proprio
     * entraria duas vezes na proposta: uma pelo preco da serie e outra pelo
     * preco geral.
     */
    private List<ProdutoPreco> maisEspecificoPorModalidade(List<ProdutoPreco> precos) {
        var porModalidade = new LinkedHashMap<Long, ProdutoPreco>();
        var criterio = Comparator.comparingInt(ProdutoPreco::especificidade)
                .thenComparing(ProdutoPreco::getVigenciaInicio);

        for (var preco : precos) {
            porModalidade.merge(preco.getModalidade().getId(), preco,
                    (atual, novo) -> criterio.compare(novo, atual) > 0 ? novo : atual);
        }
        return List.copyOf(porModalidade.values());
    }

    private <T> T referencia(Class<T> tipo, Long id) {
        return id == null ? null : entityManager.getReference(tipo, id);
    }
}
