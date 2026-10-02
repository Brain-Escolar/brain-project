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
import jakarta.persistence.FetchType;
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
 * Medicação em uso do aluno.
 *
 * Cadastrada pelo responsável no portal (nome, dosagem, horário) ou pela
 * Orientação, que também anexa a receita e define o período de administração.
 * O responsável só inclui — desativar é da escola, para que nada saia do
 * histórico de saúde de um menor sem que a escola saiba.
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ficha_medica_id", nullable = false)
    private FichaMedica fichaMedica;

    @Column(nullable = false)
    private String nome;

    private String dosagem;

    private String horario;

    @Column(length = 500)
    private String observacao;

    @Column(nullable = false)
    private Boolean ativa = true;

    /** Receita anexada. Opcional — nem toda medicação chega com documento. */
    @ManyToOne
    @JoinColumn(name = "arquivo_id")
    private Arquivo arquivo;

    /**
     * Nulo no que veio do portal: a família não classifica o uso. Quando é
     * contínuo, dataInicio/dataFim ficam nulos.
     */
    @Column(name = "tipo_uso")
    @Enumerated(EnumType.STRING)
    private TipoUsoMedicacao tipoUso;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;
}
