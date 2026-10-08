package br.com.brain.contrato;

import br.com.brain.enums.StatusTitulo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TituloRepository extends JpaRepository<Titulo, Long> {

    List<Titulo> findByContratoIdOrderByNumeroParcelaAscIdAsc(Long contratoId);

    /** A tela do responsavel: o indice idx_titulos_portal cobre exatamente isto. */
    List<Titulo> findByResponsavelIdAndStatusOrderByVencimentoAsc(Long responsavelId, StatusTitulo status);

    List<Titulo> findByResponsavelIdOrderByVencimentoAsc(Long responsavelId);

    /** Cobranca: o que venceu e ninguem pagou. */
    List<Titulo> findByStatusAndVencimentoBeforeOrderByVencimentoAsc(StatusTitulo status, LocalDate data);

    int countByContratoId(Long contratoId);
}
