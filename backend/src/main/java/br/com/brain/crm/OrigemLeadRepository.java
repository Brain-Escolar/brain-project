package br.com.brain.crm;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrigemLeadRepository extends JpaRepository<OrigemLead, Long> {
    List<OrigemLead> findAllByOrderByNomeAsc();
}
