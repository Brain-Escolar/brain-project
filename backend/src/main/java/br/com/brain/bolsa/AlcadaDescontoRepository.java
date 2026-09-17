package br.com.brain.bolsa;

import br.com.brain.enums.PerfilNome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

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
}
