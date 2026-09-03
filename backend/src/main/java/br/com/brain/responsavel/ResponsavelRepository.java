package br.com.brain.responsavel;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResponsavelRepository extends JpaRepository<Responsavel, Long> {

  Optional<Responsavel> findByDadosPessoaisCpf(String cpf);

  /**
   * Recupera o responsavel a partir dos dados pessoais do usuario autenticado,
   * ja com os alunos vinculados e o contexto escolar de cada um carregados.
   *
   * O join fetch e obrigatorio: Responsavel.alunos e todas as associacoes de
   * Aluno sao LAZY, e o guard de vinculo precisa da lista fora de transacao.
   */
  @Query("""
      select distinct r from Responsavel r
      left join fetch r.dadosPessoais rdp
      left join fetch r.alunos a
      left join fetch a.dadosPessoais
      left join fetch a.unidade
      left join fetch a.serie
      left join fetch a.turma
      where rdp.id = :dadosPessoaisId
      """)
  Optional<Responsavel> findByDadosPessoaisIdComAlunos(@Param("dadosPessoaisId") Long dadosPessoaisId);
}
