package br.com.brain.conteudo;

import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Collection;
import br.com.brain.diretor.projecao.ConteudoRegistrado;
import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ConteudoRepository extends JpaRepository<Conteudo, Long> {
    Optional<Conteudo> findByAulaIdAndData(Long aulaId, LocalDate data);

    /** Conteúdos lançados para as aulas no intervalo. */
    @Query("""
            SELECT new br.com.brain.diretor.projecao.ConteudoRegistrado(c.aula.id, c.data, c.conteudo, c.criadoEm)
            FROM Conteudo c
            WHERE c.aula.id IN :aulaIds AND c.data BETWEEN :inicio AND :fim
            """)
    List<ConteudoRegistrado> registradosNasAulas(@Param("aulaIds") Collection<Long> aulaIds,
            @Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
