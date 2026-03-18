package br.com.brain.domain.notas;

import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.avaliacao.Avaliacao;
import br.com.brain.domain.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Audited
@Table(name = "notas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Notas extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avaliacao_id", referencedColumnName = "id")
    private Avaliacao avaliacao;

    @Column(name = "pontuacao")
    private BigDecimal pontuacao;

    @Column(name = "periodo_referencia")
    private LocalDate periodoReferencia;
}
