package br.com.brain.autenticacao.repository;
import br.com.brain.autenticacao.models.*;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DadosAutenticacaoRepository extends JpaRepository<DadosAutenticacao, Long> {
    Optional<DadosAutenticacao> findByEmailIgnoreCaseAndVerificadoTrue(String email);

    Optional<DadosAutenticacao> findByToken(String codigo);
}
