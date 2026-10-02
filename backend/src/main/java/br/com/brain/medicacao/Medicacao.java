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
 * Medicacao em uso do aluno.
 *
 * Cadastrada pelo responsavel no portal e consultada pela Orientacao. O
 * responsavel so inclui — desativar e da escola, para que nada saia do
 * historico de saude de um menor sem que a escola saiba. A Orientacao tambem
 * registra o tipo e o periodo de uso, alem da receita quando disponivel.
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

    @ManyToOne
    @JoinColumn(name = "arquivo_id")
    private Arquivo arquivo;

    @Column(name = "tipo_uso")
    @Enumerated(EnumType.STRING)
    private TipoUsoMedicacao tipoUso;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(nullable = false)
    private String nome;

    private String dosagem;

    private String horario;

    @Column(length = 500)
    private String observacao;

    @Column(nullable = false)
    private Boolean ativa = true;

    @Column(name = "medicamentos")
    private String medicamentos;
}
