package br.com.brain.autenticacao;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DadosAutenticacaoRepository extends JpaRepository<DadosAutenticacao, Long> {
    Optional<DadosAutenticacao> findByEmailIgnoreCaseAndVerificadoTrue(String email);

    Optional<DadosAutenticacao> findByToken(String codigo);

    /**
     * Um mesmo DadosPessoais nao pode ter dois logins. Usado antes de criar o
     * acesso de um responsavel: ele passa por aqui uma vez por filho vinculado,
     * e a partir do segundo o login ja existe.
     */
    boolean existsByDadosPessoaisId(Long dadosPessoaisId);
}
