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
     */
    @Query("""
            SELECT p FROM ProdutoPreco p
             WHERE p.modalidade.produto.id IN :produtoIds
               AND (p.anoLetivo IS NULL OR p.anoLetivo = :anoLetivo)
               AND (p.unidade IS NULL OR p.unidade.id = :unidadeId)
               AND (p.serie IS NULL OR p.serie.id = :serieId)
               AND (p.turno IS NULL OR p.turno = :turno)
               AND p.vigenciaInicio <= :data
               AND (p.vigenciaFim IS NULL OR p.vigenciaFim >= :data)
               AND p.modalidade.ativo = true
            """)
    List<ProdutoPreco> buscarVigentes(
            @Param("produtoIds") List<Long> produtoIds,
            @Param("anoLetivo") Integer anoLetivo,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("turno") Turno turno,
            @Param("data") LocalDate data);
}
