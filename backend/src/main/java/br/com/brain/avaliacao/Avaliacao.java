package br.com.brain.avaliacao;

import br.com.brain.disciplina.Disciplina;
import br.com.brain.enums.TipoAvaliacao;

import java.math.BigDecimal;
import java.util.List;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "avaliacoes")
@Data
@EqualsAndHashCode(callSuper = false)
public class Avaliacao extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id", referencedColumnName = "id")
    private Disciplina disciplina;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false)
    private TipoAvaliacao tipo;

    @Column(name = "nota_maxima")
    private BigDecimal notaMaxima;

    private String conteudo;

    @Column(name = "nota_extra")
    private Boolean notaExtra = false;

    @NotAudited
    @OneToMany(mappedBy = "avaliacao", fetch = FetchType.LAZY)
    private List<AvaliacaoTurma> avaliacoesTurmas;

    @NotAudited
    @OneToMany(mappedBy = "avaliacao", fetch = FetchType.LAZY)
    private List<AvaliacaoAnexo> anexos;

}
