package br.com.brain.autenticacao;

import br.com.brain.enums.PerfilNome;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DadosAutenticacaoRepository extends JpaRepository<DadosAutenticacao, Long>,
        JpaSpecificationExecutor<DadosAutenticacao> {
    Optional<DadosAutenticacao> findByEmailIgnoreCaseAndVerificadoTrue(String email);

    Optional<DadosAutenticacao> findByToken(String codigo);

    /** "Esqueci a senha": o login digitado, verificado ou não. */
    Optional<DadosAutenticacao> findFirstByEmailIgnoreCase(String email);

    /**
     * Um mesmo DadosPessoais nao pode ter dois logins. Usado antes de criar o
     * acesso de um responsavel: ele passa por aqui uma vez por filho vinculado,
     * e a partir do segundo o login ja existe.
     */
    boolean existsByDadosPessoaisId(Long dadosPessoaisId);

    Optional<DadosAutenticacao> findByDadosPessoaisId(Long dadosPessoaisId);

    /**
     * Trava os logins de quem tem o perfil até o fim da transação (RU7) e
     * devolve os ids. Dois administradores que se desativam ao mesmo tempo
     * esperam um pelo outro, e o segundo já vê o primeiro desligado. Nativa e
     * com subconsulta para o FOR UPDATE travar só dados_autenticacao, e rodar
     * igual no PostgreSQL e no H2 dos testes.
     */
    @Query(value = """
            select da.id from dados_autenticacao da
            where da.dados_pessoais_id in (
                select dpp.dados_pessoais_id from dados_pessoais_perfis dpp
                join perfis p on p.id = dpp.perfil_id
                where p.nome = :perfil)
            for update
            """, nativeQuery = true)
    List<Long> travarComPerfil(@Param("perfil") String perfil);

    /**
     * Dos logins informados, quantos estão ativos e verificados, fora o
     * excluido. Nativa para ler o banco depois da trava, e não as entidades já
     * carregadas na transação.
     */
    @Query(value = """
            select count(*) from dados_autenticacao
            where id in (:ids) and id <> :excluido
              and ativo = true and verificado = true and motivo_desativacao is null
            """, nativeQuery = true)
    long contarAtivosVerificadosEntre(@Param("ids") List<Long> ids, @Param("excluido") Long excluido);

    /**
     * Quantas outras pessoas têm o perfil com login ativo, para o aviso de
     * "última com o perfil" ao remover (RU10): conversas e alertas vão para o
     * perfil, e sem ninguém nele ficam sem leitor.
     */
    @Query("""
            select count(da) from DadosAutenticacao da
            join da.dadosPessoais dp
            join dp.perfis p
            where p.nome = :perfil and dp.id <> :excluido
              and da.ativo = true and da.motivoDesativacao is null
            """)
    long contarAtivosComPerfilExceto(@Param("perfil") PerfilNome perfil, @Param("excluido") Long excluido);
}
