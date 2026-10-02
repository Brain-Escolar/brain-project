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

    boolean existsByCodigo(String codigo);

    /**
     * Listagem da tela de configuracao: inclui inativo, porque desativar e o
     * caminho de "excluir" para um tipo que ja concedeu bolsa.
     *
     * O DISTINCT nao e enfeite -- o fetch da colecao de produtos multiplica as
     * linhas, e sem ele um tipo com tres produtos apareceria tres vezes.
     */
    @Query("SELECT DISTINCT t FROM TipoBolsa t LEFT JOIN FETCH t.produtos ORDER BY t.nome")
    List<TipoBolsa> listarTodosComProdutos();

    /**
     * O seletor da tela de matricula: so os ativos, com os produtos carregados.
     *
     * Substitui findByAtivoTrueOrderByNomeAsc porque TipoBolsaDto passou a expor
     * produtoIds, e aquela consulta nao trazia a colecao -- o DTO seria montado
     * fora de transacao e quebraria com LazyInitializationException.
     */
    @Query("SELECT DISTINCT t FROM TipoBolsa t LEFT JOIN FETCH t.produtos WHERE t.ativo = true ORDER BY t.nome")
    List<TipoBolsa> listarAtivosComProdutos();
}
