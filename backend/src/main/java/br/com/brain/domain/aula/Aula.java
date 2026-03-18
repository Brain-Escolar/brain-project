package br.com.brain.domain.aula;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.chamada.Chamada;
import br.com.brain.domain.conteudo.Conteudo;
import br.com.brain.domain.anotacao.Anotacao;
import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.horario.Horario;
import br.com.brain.domain.professor.Professor;
import br.com.brain.domain.turma.Turma;
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
@Table(name = "aulas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Aula extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id", referencedColumnName = "id")
    private Disciplina disciplina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id", referencedColumnName = "id")
    private Turma turma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", referencedColumnName = "id")
    private Professor professor;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DayOfWeek diaSemana;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horario_id", referencedColumnName = "id")
    private Horario horario;

    @Column(name = "vigencia")
    private LocalDate vigencia;

    @NotAudited
    @OneToMany(mappedBy = "aula", fetch = FetchType.LAZY)
    private List<Chamada> chamadas;

    @NotAudited
    @OneToMany(mappedBy = "aula", fetch = FetchType.LAZY)
    private List<Conteudo> conteudos;

    @NotAudited
    @OneToMany(mappedBy = "aula", fetch = FetchType.LAZY)
    private List<Anotacao> anotacoes;
}
