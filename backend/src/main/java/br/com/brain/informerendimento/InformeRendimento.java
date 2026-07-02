package br.com.brain.informerendimento;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.professor.Professor;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "informes_rendimento")
@Data
@EqualsAndHashCode(callSuper = false)
public class InformeRendimento extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    private Professor professor;

    private Integer ano;

    @Column(name = "meses_considerados")
    private Integer mesesConsiderados;

    private Boolean completo = true;

    @OneToOne
    @JoinColumn(name = "arquivo_id")
    private Arquivo arquivo;
}
