package br.com.brain.bolsa;

import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

/**
 * Politica de bolsa de um ano letivo. Multi-tenancy e schema por escola, entao
 * nao ha mantenedora: a politica e unica por ano dentro do schema.
 */
@Entity
@Audited
@Table(name = "politicas_bolsa")
@Data
@EqualsAndHashCode(callSuper = false)
public class PoliticaBolsa extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ano_letivo")
    private Integer anoLetivo;

    /**
     * Mantenedora filantropica neste ano. Quando falso, nenhum envelope de
     * natureza META_MINIMA e criado e nada mais no modelo muda.
     */
    @Column(name = "exige_cebas")
    private Boolean exigeCebas = false;

    private String observacao;
}
