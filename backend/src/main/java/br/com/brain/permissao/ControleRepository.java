package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ControleRepository extends JpaRepository<Controle, Long> {

    @Query("""
            select c from Controle c
            left join fetch c.tela
            join c.perfisPermitidos p
            where p.nome = :perfil and c.ativo = true
            order by c.nome
            """)
    List<Controle> findNoTetoDoPerfil(@Param("perfil") PerfilNome perfil);
}
