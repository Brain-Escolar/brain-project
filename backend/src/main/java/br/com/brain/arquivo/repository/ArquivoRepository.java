package br.com.brain.arquivo.repository;
import br.com.brain.arquivo.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArquivoRepository extends JpaRepository<Arquivo, Long> {
}
