package br.com.brain.contrato;

import br.com.brain.enums.StatusContratoServico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContratoServicoRepository extends JpaRepository<ContratoServico, Long> {

    List<ContratoServico> findByMatriculaIdOrderByIdDesc(Long matriculaId);

    /**
     * Quantos contratos esta matricula ja teve. Usado para numerar: rescindir e
     * refazer gera um segundo contrato para a MESMA matricula, e `numero` e unico
     * no banco -- sem o sufixo, o segundo estoura a constraint.
     */
    int countByMatriculaId(Long matriculaId);

    boolean existsByMatriculaIdAndStatus(Long matriculaId, StatusContratoServico status);

    /**
     * Com os itens carregados, para a leitura que monta o DTO fora de transacao.
     * DISTINCT porque o fetch da colecao multiplica as linhas.
     */
    @Query("""
            SELECT DISTINCT c FROM ContratoServico c
              LEFT JOIN FETCH c.itens
             WHERE c.id = :id
            """)
    Optional<ContratoServico> buscarComItens(@Param("id") Long id);

    /**
     * Os contratos de um aluno, para a tela de baixa da secretaria.
     *
     * A comparacao tipada vem ANTES do IS NULL de proposito -- a razao esta
     * documentada em AlunoRepository.buscarMatriculadosParaOrientacao: o Hibernate
     * infere o tipo do parametro pelo contexto, e `:param IS NULL` sozinho nao da
     * contexto nenhum; invertido, o parametro chega ao PostgreSQL como bytea.
     */
    @Query("""
            SELECT DISTINCT c FROM ContratoServico c
              LEFT JOIN FETCH c.itens
              JOIN c.matricula m
             WHERE m.aluno.id = :alunoId
               AND (m.anoLetivo = :anoLetivo OR :anoLetivo IS NULL)
             ORDER BY c.id DESC
            """)
    List<ContratoServico> buscarDoAlunoComItens(
            @Param("alunoId") Long alunoId,
            @Param("anoLetivo") Integer anoLetivo);
}
