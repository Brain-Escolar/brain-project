package br.com.brain.produto;

import br.com.brain.enums.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProdutoPrecoRepository extends JpaRepository<ProdutoPreco, Long> {

    /**
     * Todos os precos vigentes que casam com a dimensao, de qualquer modalidade
     * dos produtos informados. O desempate por especificidade fica no servico.
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
            """)
    List<ProdutoPreco> buscarVigentesDoCatalogo(
            @Param("anoLetivo") Integer anoLetivo,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("turno") Turno turno,
            @Param("data") LocalDate data);
}
