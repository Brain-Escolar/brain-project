package br.com.brain.secretario;

import br.com.brain.enums.PerfilNome;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SecretarioRepository extends JpaRepository<Secretario, Long> {

    boolean existsByDadosPessoaisId(Long dadosPessoaisId);

    Optional<Secretario> findFirstByDadosPessoaisId(Long dadosPessoaisId);

    /**
     * A equipe do CRM: quem tem o registro de secretário, o perfil e o login
     * ativo (RU9). O registro nunca é apagado pela tela de Usuários; quem perde
     * o perfil ou tem o login desligado sai da distribuição da fila.
     */
    @Query("""
            select s from Secretario s
            join fetch s.dadosPessoais dp
            where exists (select 1 from DadosAutenticacao da
                          where da.dadosPessoais = dp and da.ativo = true and da.motivoDesativacao is null)
              and exists (select 1 from DadosPessoais d join d.perfis p where d = dp and p.nome = :perfil)
            order by dp.nome
            """)
    List<Secretario> findAtendentes(@Param("perfil") PerfilNome perfil);

    default List<Secretario> findAtendentes() {
        return findAtendentes(PerfilNome.SECRETARIO);
    }
}
