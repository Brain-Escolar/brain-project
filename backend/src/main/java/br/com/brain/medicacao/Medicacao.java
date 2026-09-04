package br.com.brain.medicacao;

import java.time.LocalDate;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.enums.TipoUsoMedicacao;
import br.com.brain.fichamedica.FichaMedica;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

/**
 * Medicação que o aluno faz uso, com a receita anexada e o período em que deve
 * ser administrada. Quando o uso é contínuo, dataInicio/dataFim ficam nulos.
 */
@Entity
@Audited
@Table(name = "medicacoes")
@Data
@EqualsAndHashCode(callSuper = false)
public class Medicacao extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ficha_medica_id", nullable = false)
    private FichaMedica fichaMedica;

    /** Receita anexada. Opcional — nem toda medicação chega com documento. */
    @ManyToOne
    @JoinColumn(name = "arquivo_id")
    private Arquivo arquivo;

    @Column(name = "tipo_uso", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoUsoMedicacao tipoUso;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "medicamentos")
    private String medicamentos;

    @Column(name = "observacao")
    private String observacao;
}
