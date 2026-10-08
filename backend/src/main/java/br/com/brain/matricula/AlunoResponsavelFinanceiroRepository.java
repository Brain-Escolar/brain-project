package br.com.brain.matricula;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AlunoResponsavelFinanceiroRepository
        extends JpaRepository<AlunoResponsavelFinanceiro, Long> {

    /**
     * O rateio vigente numa data, com o responsavel carregado.
     *
     * O JOIN FETCH nao e enfeite: quem emite os titulos monta um por responsavel
     * e precisa da entidade, nao so do id.
     *
     * Ordenado com o principal primeiro: e ele que recebe o centavo que sobra da
     * divisao, e a ordem deixa isso previsivel em vez de depender do banco.
     */
    @Query("""
            SELECT arf FROM AlunoResponsavelFinanceiro arf
              JOIN FETCH arf.responsavel
             WHERE arf.aluno.id = :alunoId
               AND arf.vigenciaInicio <= :data
               AND (arf.vigenciaFim IS NULL OR arf.vigenciaFim >= :data)
             ORDER BY arf.principal DESC, arf.id
            """)
    List<AlunoResponsavelFinanceiro> buscarVigentes(
            @Param("alunoId") Long alunoId,
            @Param("data") LocalDate data);
}
