package br.com.brain.bolsa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TipoBolsaRepository extends JpaRepository<TipoBolsa, Long> {

    Optional<TipoBolsa> findByCodigo(String codigo);

    List<TipoBolsa> findByAtivoTrueOrderByNomeAsc();

    /**
     * Traz os produtos junto. O calculo do valor cheio precisa deles, e a
     * colecao e LAZY: sem o fetch, quebraria com LazyInitializationException
     * fora de transacao.
     */
    @Query("SELECT t FROM TipoBolsa t LEFT JOIN FETCH t.produtos WHERE t.id = :id")
    Optional<TipoBolsa> buscarComProdutos(@Param("id") Long id);
}
