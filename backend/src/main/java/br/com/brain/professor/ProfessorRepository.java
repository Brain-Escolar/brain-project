package br.com.brain.professor;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.brain.aula.dto.ListagemAulaDto;
import br.com.brain.exception.ErrosSistema;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {

    Optional<Professor> findByIdAndAtivoTrue(Long id);

    Optional<Professor> findByIdAndAtivoFalse(Long id);

    Page<Professor> findByAtivoTrue(Pageable pageable);

    long countByAtivoTrue();

    Optional<Professor> findByDadosPessoaisId(Long dadosPessoaisId);

    Optional<Professor> findByDadosPessoaisIdAndAtivoTrue(Long dadosPessoaisId);

    /**
     * Professor que vai receber uma atribuicao nova (aula, avaliacao, evento,
     * tarefa). Desligado nao recebe: ele nao entra mais no sistema para dar
     * conta dela. O frontend ja so lista ativos; isto e a garantia do backend.
     */
    default Professor exigirAtivo(Long id) {
        var professor = findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Professor", id));
        if (!Boolean.TRUE.equals(professor.getAtivo())) {
            throw ErrosSistema.OperacaoInvalidaException.com(professor.getDadosPessoais().getNome()
                    + " está inativo(a) e não pode receber novas atribuições. Reative o cadastro antes.");
        }
        return professor;
    }

    /**
     * Na edicao: manter o professor que ja estava e permitido mesmo se ele foi
     * desligado depois (a tela reenvia o formulario inteiro, e o historico nao
     * pode travar a edicao de uma data). So a troca para um inativo e barrada.
     */
    default Professor exigirAtivoSeMudou(Long id, Professor atual) {
        if (atual != null && id.equals(atual.getId())) {
            return atual;
        }
        return exigirAtivo(id);
    }

    @Query("""
            SELECT aula
            FROM Aula aula
            WHERE aula.professor.dadosPessoais.matricula = :matricula
            AND aula.turma.anoLetivo = :anoLetivo
            """)
    List<ListagemAulaDto> gerarGradeHoraria(@Param("matricula") String matricula,
            @Param("anoLetivo") int anoLetivo);

    /** Todos os professores, com dados pessoais, em ordem alfabética. */
    @Query("SELECT p FROM Professor p JOIN FETCH p.dadosPessoais dp ORDER BY dp.nome")
    List<Professor> findTodosComDadosPessoais();
}
