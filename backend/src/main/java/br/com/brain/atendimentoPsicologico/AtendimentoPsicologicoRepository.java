package br.com.brain.atendimentoPsicologico;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AtendimentoPsicologicoRepository extends JpaRepository<AtendimentoPsicologico, Long> {

    /** Do mais recente para o mais antigo; o id desempata registros do mesmo dia. */
    List<AtendimentoPsicologico> findByAlunoIdOrderByDataDescIdDesc(Long alunoId);
}
