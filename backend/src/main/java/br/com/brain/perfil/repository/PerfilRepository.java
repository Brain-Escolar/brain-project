package br.com.brain.perfil.repository;
import br.com.brain.perfil.models.*;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.brain.enums.PerfilNome;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {
    Perfil findByNome(PerfilNome perfilNome);
}
