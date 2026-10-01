package br.com.brain.bolsa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface MatrizDescontoRepository extends JpaRepository<MatrizDesconto, Long> {

    /**
     * Todas as regras que casam com o aluno na data da proposta. O desempate por
     * especificidade fica no servico, que e onde da para ler.
     *
     * A data e a DA PROPOSTA, nao "hoje": a matriz do ano letivo seguinte comeca
     * a valer durante a campanha, e uma proposta revista depois precisa ser
     * avaliada pela regra que valia quando foi feita.
     */
    @Query("""
            SELECT m FROM MatrizDesconto m
             WHERE m.politica.id = :politicaId
               AND m.tipoBolsa.id = :tipoBolsaId
               AND (m.unidade IS NULL OR m.unidade.id = :unidadeId)
               AND (m.serie IS NULL OR m.serie.id = :serieId)
               AND m.vigenciaInicio <= :data
               AND (m.vigenciaFim IS NULL OR m.vigenciaFim >= :data)
            """)
    List<MatrizDesconto> buscarVigentes(
            @Param("politicaId") Long politicaId,
            @Param("tipoBolsaId") Long tipoBolsaId,
            @Param("unidadeId") Long unidadeId,
            @Param("serieId") Long serieId,
            @Param("data") LocalDate data);

    /**
     * Todas as regras de um tipo de bolsa, sem filtro de escopo nem de data.
     *
     * E o insumo da deteccao de sobreposicao, e de proposito traz tudo: comparar
     * escopo nulo ("vale para qualquer") e cruzamento de vigencia em SQL exige
     * `:param IS NULL` e aritmetica de data que o PostgreSQL e o H2 tratam
     * diferente. Sao poucas linhas por politica -- o indice
     * idx_matrizes_desconto_busca cobre exatamente este par -- entao a
     * comparacao sai em Java, onde da para ler e testar sem banco.
     */
    List<MatrizDesconto> findByPoliticaIdAndTipoBolsaIdOrderByIdAsc(Long politicaId, Long tipoBolsaId);

    /** Listagem da tela de configuracao: inclui regra futura e regra encerrada. */
    @Query("""
            SELECT m FROM MatrizDesconto m
              JOIN FETCH m.tipoBolsa
             WHERE m.politica.id = :politicaId
             ORDER BY m.tipoBolsa.nome, m.vigenciaInicio DESC, m.id
            """)
    List<MatrizDesconto> listarDaPolitica(@Param("politicaId") Long politicaId);

    int countByPoliticaId(Long politicaId);
}
