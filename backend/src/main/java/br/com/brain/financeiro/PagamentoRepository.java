package br.com.brain.financeiro;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    List<Pagamento> findByTituloIdOrderByIdDesc(Long tituloId);

    /**
     * As baixas que ainda valem para um conjunto de titulos. A tela do
     * responsavel e o carne usam isto para dizer "pago em 10/02 por Pix" sem uma
     * consulta por parcela.
     */
    @Query("""
            SELECT p FROM Pagamento p
             WHERE p.titulo.id IN :tituloIds
               AND p.estornadoEm IS NULL
            """)
    List<Pagamento> buscarVivosPorTitulos(@Param("tituloIds") List<Long> tituloIds);

    /**
     * Caixa do dia: o que entrou numa data, estornos de fora.
     *
     * O JOIN FETCH chega ate o aluno porque a conferencia e feita lendo nome por
     * nome contra o comprovante.
     */
    @Query("""
            SELECT p FROM Pagamento p
              JOIN FETCH p.titulo t
              JOIN FETCH t.contrato c
              JOIN FETCH c.matricula m
              JOIN FETCH m.aluno a
              LEFT JOIN FETCH a.dadosPessoais
             WHERE p.dataPagamento = :data
               AND p.estornadoEm IS NULL
             ORDER BY p.id ASC
            """)
    List<Pagamento> buscarDoDia(@Param("data") LocalDate data);

    boolean existsByTituloIdAndEstornadoEmIsNull(Long tituloId);
}
