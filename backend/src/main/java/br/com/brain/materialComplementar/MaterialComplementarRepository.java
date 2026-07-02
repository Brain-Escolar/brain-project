package br.com.brain.materialComplementar;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialComplementarRepository extends JpaRepository<MaterialComplementar, Long> {

    List<MaterialComplementar> findByDisciplinaIdInOrderByCriadoEmDesc(List<Long> disciplinaIds);
}
