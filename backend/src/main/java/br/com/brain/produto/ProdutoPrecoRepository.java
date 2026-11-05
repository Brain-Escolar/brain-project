package br.com.brain.produto;

import br.com.brain.enums.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProdutoPrecoRepository extends JpaRepository<ProdutoPreco, Long> {

    /**
     * Todos os precos APROVADOS e vigentes que casam com a dimensao, de qualquer
     * modalidade dos produtos informados. O desempate por especificidade fica no
     * servico.
     *
     * O filtro de status esta aqui, e nao na tela, de proposito: e ele que faz a
     * aprovacao ter dentes. Na tela, um preco pendente continuaria precificando
     * proposta e a coluna de aprovacao serviria so para relatorio.
     *
     * O JOIN FETCH ate o produto e obrigatorio, nao otimizacao: quem consome
     * isto e o BolsaTetoService, que NAO e @Transactional de proposito e navega
     * preco -> modalidade -> produto para desempatar. Sem o fetch, a sessao ja
     * fechou quando ele chega la e sai LazyInitializationException.
     *
     * A navegacao implicita (p.modalidade.produto.id) gerava um join interno
     * para o WHERE sem trazer nada carregado -- a consulta funcionava e a
     * leitura seguinte quebrava.
     */
    @Query("""
            SELECT p FROM ProdutoPreco p
              JOIN FETCH p.modalidade m
              JOIN FETCH m.produto pr
             WHERE pr.id IN :produtoIds
               AND (p.anoLetivo IS NULL OR p.anoLetivo = :anoLetivo)
               AND (p.unidade IS NULL OR p.unidade.id = :unidadeId)
               AND (p.serie IS NULL OR p.serie.id = :serieId)
               AND (p.turno IS NULL OR p.turno = :turno)
               AND p.vigenciaInicio <= :data
               AND (p.vigenciaFim IS NULL OR p.vigenciaFim >= :data)
               AND m.ativo = true
               AND p.status = br.com.brain.enums.StatusProdutoPreco.APROVADO
            """)
    List<ProdutoPreco> buscarVigentes(
            @Param("produtoIds") List<Long> produtoIds,
            @Param("anoLetivo") Integer anoLetivo,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("turno") Turno turno,
            @Param("data") LocalDate data);

    /**
     * Mesma consulta, sem filtrar por produto: e o catalogo inteiro que vale
     * para esta serie/turno, que e o que a proposta precisa montar.
     *
     * O JOIN FETCH nao e enfeite: a simulacao le natureza e permite_bolsa de
     * cada produto logo em seguida e, sem ele, sairia uma consulta por linha de
     * preco.
     */
    @Query("""
            SELECT p FROM ProdutoPreco p
              JOIN FETCH p.modalidade m
              JOIN FETCH m.produto pr
             WHERE pr.ativo = true
               AND m.ativo = true
               AND (p.anoLetivo IS NULL OR p.anoLetivo = :anoLetivo)
               AND (p.unidade IS NULL OR p.unidade.id = :unidadeId)
               AND (p.serie IS NULL OR p.serie.id = :serieId)
               AND (p.turno IS NULL OR p.turno = :turno)
               AND p.vigenciaInicio <= :data
               AND (p.vigenciaFim IS NULL OR p.vigenciaFim >= :data)
               AND p.status = br.com.brain.enums.StatusProdutoPreco.APROVADO
            """)
    List<ProdutoPreco> buscarVigentesDoCatalogo(
            @Param("anoLetivo") Integer anoLetivo,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("turno") Turno turno,
            @Param("data") LocalDate data);

    /**
     * Todos os precos de uma modalidade, vigentes ou nao, do mais recente para o
     * mais antigo.
     *
     * Traz os encerrados e os futuros de proposito: esta tabela E o historico de
     * preco (nao ha gemea _AUD, ver V100), entao esconder as linhas antigas
     * esconderia a unica resposta para "quanto custava quando o contrato foi
     * assinado".
     *
     * LEFT JOIN FETCH em unidade e serie porque o DTO le o nome das duas, e
     * ambas sao LAZY: sem isso sai uma consulta por linha, ou estoura fora da
     * transacao.
     */
    /**
     * A fila de quem aprova preco: tudo pendente, do pedido mais antigo para o
     * mais novo -- reajuste esquecido e reajuste que nao entra em vigor.
     *
     * Os FETCH nao sao enfeite: o DTO le nome de produto, modalidade, unidade e
     * serie, e todos sao LAZY.
     */
    @Query("""
            SELECT p FROM ProdutoPreco p
              JOIN FETCH p.modalidade m
              JOIN FETCH m.produto pr
              LEFT JOIN FETCH p.unidade
              LEFT JOIN FETCH p.serie
             WHERE p.status = br.com.brain.enums.StatusProdutoPreco.PENDENTE_APROVACAO
             ORDER BY p.criadoEm ASC, p.id ASC
            """)
    List<ProdutoPreco> buscarPendentesDeAprovacao();

    @Query("""
            SELECT p FROM ProdutoPreco p
              LEFT JOIN FETCH p.unidade
              LEFT JOIN FETCH p.serie
             WHERE p.modalidade.id = :modalidadeId
             ORDER BY p.vigenciaInicio DESC, p.id DESC
            """)
    List<ProdutoPreco> buscarDaModalidade(@Param("modalidadeId") Long modalidadeId);
}
