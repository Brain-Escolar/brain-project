package br.com.brain.shared.perfil;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.brain.shared.enums.PerfilNome;

public interface PerfilRepository extends JpaRepository<Perfil, Long> {
    Perfil findByNome(PerfilNome perfilNome);
}
