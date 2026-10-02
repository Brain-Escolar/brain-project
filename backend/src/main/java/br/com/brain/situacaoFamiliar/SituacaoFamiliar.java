package br.com.brain.situacaoFamiliar;

import java.util.ArrayList;
import java.util.List;

import br.com.brain.aluno.Aluno;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

/**
 * Contexto familiar do aluno registrado pela orientação: um texto descritivo
 * mais as marcações escolhidas do catálogo. Um registro por aluno, atualizado
 * ao longo do tempo.
 */
@Entity
@Audited
@Table(name = "situacoes_familiares")
@Data
@EqualsAndHashCode(callSuper = false)
public class SituacaoFamiliar extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "aluno_id", referencedColumnName = "id", nullable = false, unique = true)
    private Aluno aluno;

    @Column(name = "descricao")
    private String descricao;

    @NotAudited
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "situacao_familiar_marcacoes", joinColumns = @JoinColumn(name = "situacao_familiar_id"), inverseJoinColumns = @JoinColumn(name = "opcao_id"))
    private List<SituacaoFamiliarOpcao> opcoes = new ArrayList<>();
}
