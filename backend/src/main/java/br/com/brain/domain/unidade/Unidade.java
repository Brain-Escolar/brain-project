package br.com.brain.domain.unidade;

import br.com.brain.domain.turma.Turma;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.aluno.Aluno;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "unidades")
@Data
@EqualsAndHashCode(callSuper = false)
public class Unidade extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @NotAudited
    @OneToMany(mappedBy = "unidade", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Aluno> alunos = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "unidade", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Turma> turmas = new ArrayList<>();
}
