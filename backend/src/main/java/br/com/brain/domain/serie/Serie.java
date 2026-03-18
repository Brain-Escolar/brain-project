package br.com.brain.domain.serie;

import br.com.brain.domain.disciplina.Disciplina;
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
@Table(name = "series")
@Data
@EqualsAndHashCode(callSuper = false)
public class Serie extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @NotAudited
    @OneToMany(mappedBy = "serie", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Aluno> alunos = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "serie", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Disciplina> disciplinas = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "serie", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Turma> turmas = new ArrayList<>();
}
