package br.com.brain.contrato;

import br.com.brain.enums.StatusTitulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TituloRepository extends JpaRepository<Titulo, Long> {

    List<Titulo> findByContratoIdOrderByNumeroParcelaAscIdAsc(Long contratoId);

    /** A tela do responsavel: o indice idx_titulos_portal cobre exatamente isto. */
    List<Titulo> findByResponsavelIdAndStatusOrderByVencimentoAsc(Long responsavelId, StatusTitulo status);

    List<Titulo> findByResponsavelIdOrderByVencimentoAsc(Long responsavelId);

    /** Cobranca: o que venceu e ninguem pagou. */
    List<Titulo> findByStatusAndVencimentoBeforeOrderByVencimentoAsc(StatusTitulo status, LocalDate data);

    int countByContratoId(Long contratoId);

    /**
     * Trava a linha do titulo para dar baixa.
     *
     * SQL nativo, e nao @Lock(PESSIMISTIC_WRITE), porque no Postgres o @Lock do
     * Hibernate emite `FOR NO KEY UPDATE` -- valido no Postgres e recusado pelo
     * H2 dos testes. Foi o que derrubou os testes de envelope; a solucao e a
     * mesma de EnvelopeBolsaRepository.
     *
     * Sem a trava, duas secretarias clicando "dar baixa" na mesma parcela ao
     * mesmo tempo passariam as duas pelo teste de status ABERTO e gravariam dois
     * pagamentos. Com ela, a segunda espera, le o status ja PAGO e recebe erro.
     */
    @Query(value = "SELECT * FROM titulos WHERE id = :id FOR UPDATE", nativeQuery = true)
    Optional<Titulo> travarParaBaixa(@Param("id") Long id);

    /**
     * Os titulos de um responsavel com tudo que a tela dele precisa: o contrato,
     * a matricula e o nome do aluno.
     *
     * O JOIN FETCH nao e otimizacao, e requisito: o DTO e montado com as
     * associacoes todas LAZY, e sem o fetch isto quebra em
     * LazyInitializationException ou vira uma consulta por parcela.
     *
     * A comparacao tipada vem ANTES do IS NULL de proposito -- mesma razao
     * documentada em AlunoRepository.buscarMatriculadosParaOrientacao: o
     * Hibernate infere o tipo do parametro pelo contexto, e `:param IS NULL`
     * sozinho nao da contexto nenhum. Invertido, o parametro chega ao PostgreSQL
     * como bytea e a consulta quebra.
     */
    @Query("""
            SELECT t FROM Titulo t
              JOIN FETCH t.contrato c
              JOIN FETCH c.matricula m
              JOIN FETCH m.aluno a
              LEFT JOIN FETCH a.dadosPessoais
             WHERE t.responsavel.id = :responsavelId
               AND (m.anoLetivo = :anoLetivo OR :anoLetivo IS NULL)
             ORDER BY t.vencimento ASC, t.numeroParcela ASC, t.versao ASC
            """)
    List<Titulo> buscarDoResponsavelComContexto(
            @Param("responsavelId") Long responsavelId,
            @Param("anoLetivo") Integer anoLetivo);

    /**
     * Base do aging: tudo que esta ABERTO no escopo pedido, vencido ou nao.
     *
     * Traz tambem o que esta a vencer porque o relatorio precisa do total da
     * carteira para a inadimplencia significar algo -- 40 mil em atraso e uma
     * noticia muito diferente se a carteira e 100 mil ou 2 milhoes.
     */
    @Query("""
            SELECT t FROM Titulo t
              JOIN FETCH t.contrato c
              JOIN FETCH c.matricula m
              JOIN FETCH m.aluno a
              LEFT JOIN FETCH a.dadosPessoais
              JOIN FETCH t.responsavel r
              LEFT JOIN FETCH r.dadosPessoais
             WHERE t.status = br.com.brain.enums.StatusTitulo.ABERTO
               AND (m.unidade.id = :unidadeId OR :unidadeId IS NULL)
               AND (m.anoLetivo = :anoLetivo OR :anoLetivo IS NULL)
             ORDER BY t.vencimento ASC, t.id ASC
            """)
    List<Titulo> buscarAbertosParaAging(
            @Param("unidadeId") Long unidadeId,
            @Param("anoLetivo") Integer anoLetivo);
}
