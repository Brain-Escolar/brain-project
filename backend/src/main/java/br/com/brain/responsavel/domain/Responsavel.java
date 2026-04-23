package br.com.brain.responsavel.domain;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.shared.domain.EntidadeBase;
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

import java.util.ArrayList;
import java.util.List;

@Entity
@Audited
@Table(name = "responsaveis")
@Data
@EqualsAndHashCode(callSuper = false)
public class Responsavel extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotAudited
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "alunos_responsaveis", joinColumns = @JoinColumn(name = "responsavel_id"), inverseJoinColumns = @JoinColumn(name = "aluno_id"))
    private List<Aluno> alunos = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dados_pessoais_id", referencedColumnName = "id")
    private DadosPessoais dadosPessoais;

    private Boolean financeiro = false;
}
