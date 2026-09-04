package br.com.brain.situacaoFamiliar;

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
 * Catálogo de marcações da situação familiar. Fica em tabela para a escola
 * poder ajustar a lista sem deploy e para os relatórios agruparem por id
 * estável.
 */
@Entity
@Audited
@Table(name = "situacao_familiar_opcoes")
@Data
@EqualsAndHashCode(callSuper = false)
public class SituacaoFamiliarOpcao extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String descricao;

    @Column(nullable = false)
    private Integer ordem = 0;

    /** Opção aposentada não aparece mais na tela, mas segue nas marcações antigas. */
    @Column(nullable = false)
    private Boolean ativo = true;
}
