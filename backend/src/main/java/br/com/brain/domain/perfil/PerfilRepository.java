package br.com.brain.domain.perfil;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.brain.enums.PerfilNome;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {
    Perfil findByNome(PerfilNome perfilNome);
}
