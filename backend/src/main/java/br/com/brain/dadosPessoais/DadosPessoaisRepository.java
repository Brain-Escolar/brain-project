package br.com.brain.dadosPessoais;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.com.brain.enums.PerfilNome;

public interface DadosPessoaisRepository extends JpaRepository<DadosPessoais, Long> {

    Optional<DadosPessoais> findByCpf(String cpf);

    /**
     * Quem tem determinado perfil. Base da distribuicao de alertas — antes
     * disso nao havia como perguntar "quem e da Orientacao?".
     */
    @Query("""
            select dp from DadosPessoais dp
            join dp.perfis p
            where p.nome = :perfilNome
            """)
    List<DadosPessoais> findByPerfilNome(@Param("perfilNome") PerfilNome perfilNome);
}
