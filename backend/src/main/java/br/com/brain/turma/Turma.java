package br.com.brain.turma;

import br.com.brain.serie.Serie;
import br.com.brain.unidade.Unidade;
import br.com.brain.enums.Turno;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.com.brain.shared.EntidadeBase;
import br.com.brain.aluno.Aluno;
import br.com.brain.aula.Aula;
import br.com.brain.tarefa.Tarefa;
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
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "turmas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Turma extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", referencedColumnName = "id")
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", referencedColumnName = "id")
    private Serie serie;

    private String nome;

    private String sala;

    private int vagas;

    @Column(name = "ano_letivo")
    private int anoLetivo;

    @Enumerated(EnumType.STRING)
    private Turno turno;

    @NotAudited
    @OneToMany(mappedBy = "turma", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Aluno> alunos = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "turma", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Aula> aulas = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "turma", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Tarefa> tarefas = new ArrayList<>();
}
