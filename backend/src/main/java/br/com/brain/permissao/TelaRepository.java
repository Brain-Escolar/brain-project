package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TelaRepository extends JpaRepository<Tela, Long> {

    /** Telas ativas dentro do teto do perfil, por nome (a tela de grupos mostra uma lista única). */
    @Query("""
            select t from Tela t
            join t.perfisPermitidos p
            where p.nome = :perfil and t.ativo = true
            order by t.nome
            """)
    List<Tela> findNoTetoDoPerfil(@Param("perfil") PerfilNome perfil);
}
