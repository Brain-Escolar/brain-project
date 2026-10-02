package br.com.brain.comunicado;

import br.com.brain.autenticacao.DadosAutenticacao;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Traduz uma regra de público-alvo (papel + recorte) nos ids de usuário que devem receber o comunicado.
 * Passar turmaId e serieId nulos significa "toda a escola".
 */
public interface ComunicadoPublicoRepository extends Repository<DadosAutenticacao, Long> {

    @Query("""
            SELECT usuario.id FROM DadosAutenticacao usuario
            WHERE usuario.dadosPessoais.id IN (
                SELECT aluno.dadosPessoais.id FROM Aluno aluno
                WHERE aluno.matriculado = true
                  AND (:turmaId IS NULL OR aluno.turma.id = :turmaId)
                  AND (:serieId IS NULL OR aluno.serie.id = :serieId)
            )
            """)
    List<Long> buscarUsuariosAlunos(@Param("turmaId") Long turmaId, @Param("serieId") Long serieId);

    @Query("""
            SELECT usuario.id FROM DadosAutenticacao usuario
            WHERE usuario.dadosPessoais.id IN (
                SELECT responsavel.dadosPessoais.id FROM Responsavel responsavel
                JOIN responsavel.alunos aluno
                WHERE aluno.matriculado = true
                  AND (:turmaId IS NULL OR aluno.turma.id = :turmaId)
                  AND (:serieId IS NULL OR aluno.serie.id = :serieId)
            )
            """)
    List<Long> buscarUsuariosResponsaveis(@Param("turmaId") Long turmaId, @Param("serieId") Long serieId);

    @Query("""
            SELECT usuario.id FROM DadosAutenticacao usuario
            WHERE usuario.dadosPessoais.id IN (
                SELECT professor.dadosPessoais.id FROM Professor professor
                WHERE professor.ativo = true
                  AND (:turmaId IS NULL OR EXISTS (
                        SELECT 1 FROM Aula aula
                        WHERE aula.professor = professor AND aula.turma.id = :turmaId))
                  AND (:serieId IS NULL OR EXISTS (
                        SELECT 1 FROM Aula aula
                        WHERE aula.professor = professor AND aula.turma.serie.id = :serieId))
            )
            """)
    List<Long> buscarUsuariosProfessores(@Param("turmaId") Long turmaId, @Param("serieId") Long serieId);
}
