package br.com.brain.domain.professor;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.brain.dto.aula.ListagemAulaDto;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {

    Optional<Professor> findByIdAndAtivoTrue(Long id);

    Optional<Professor> findByIdAndAtivoFalse(Long id);

    Page<Professor> findByAtivoTrue(Pageable pageable);

    Optional<Professor> findByDadosPessoaisId(Long dadosPessoaisId);

    @Query("""
            SELECT aula
            FROM Aula aula
            WHERE aula.professor.dadosPessoais.matricula = :matricula
            """)
    List<ListagemAulaDto> gerarGradeHoraria(@Param("matricula") String matricula);
}
