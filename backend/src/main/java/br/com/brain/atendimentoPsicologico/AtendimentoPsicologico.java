package br.com.brain.atendimentoPsicologico;

import java.time.LocalDate;

import br.com.brain.aluno.Aluno;
import br.com.brain.laudoMedico.LaudoMedico;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
 * Atendimento psicológico do aluno registrado pela orientação. Não confundir
 * com os "atendimentos" da tela inicial da Orientação, que são conversas do
 * Fale Conosco.
 *
 * <p>É histórico clínico: a aplicação só acrescenta registros, nunca edita nem
 * remove.
 */
@Entity
@Audited
@Table(name = "atendimentos_psicologicos")
@Data
@EqualsAndHashCode(callSuper = false)
public class AtendimentoPsicologico extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    /** Texto livre — o psicólogo costuma ser externo e não tem login. */
    @Column(name = "profissional")
    private String profissional;

    @Column(name = "descricao", nullable = false)
    private String descricao;

    /** Laudo da ficha médica citado no atendimento. Opcional. */
    @ManyToOne
    @JoinColumn(name = "laudo_id")
    private LaudoMedico laudo;
}
