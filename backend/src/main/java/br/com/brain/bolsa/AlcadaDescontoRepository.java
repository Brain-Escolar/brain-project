package br.com.brain.bolsa;

import br.com.brain.enums.PerfilNome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface AlcadaDescontoRepository extends JpaRepository<AlcadaDesconto, Long> {

    /**
     * Alcadas dos perfis que o usuario tem. Quem acumula perfis fica com a maior:
     * e a mesma regra que o frontend ja aplica ("as capacidades dos demais
     * continuam valendo pela lista completa").
     */
    @Query("""
            SELECT a FROM AlcadaDesconto a
             WHERE a.politica.id = :politicaId
               AND a.perfil.nome IN :perfis
            """)
    List<AlcadaDesconto> buscarPorPerfis(
            @Param("politicaId") Long politicaId,
            @Param("perfis") Collection<PerfilNome> perfis);

    /**
     * Para o upsert da tela de configuracao.
     *
     * O banco tem UNIQUE (politica_id, perfil_id), entao gravar duas vezes o
     * mesmo perfil explode. Quem configura nao pensa "criar ou editar", pensa
     * "a direcao vai ate 100%" -- o servico procura por aqui e atualiza se achar.
     */
    @Query("""
            SELECT a FROM AlcadaDesconto a
             WHERE a.politica.id = :politicaId
               AND a.perfil.nome = :perfil
            """)
    Optional<AlcadaDesconto> buscarDoPerfil(
            @Param("politicaId") Long politicaId,
            @Param("perfil") PerfilNome perfil);

    @Query("""
            SELECT a FROM AlcadaDesconto a
              JOIN FETCH a.perfil
             WHERE a.politica.id = :politicaId
             ORDER BY a.percentualMax DESC, a.id
            """)
    List<AlcadaDesconto> listarDaPolitica(@Param("politicaId") Long politicaId);

    int countByPoliticaId(Long politicaId);
}
