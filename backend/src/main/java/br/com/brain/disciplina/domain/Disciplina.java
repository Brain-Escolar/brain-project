package br.com.brain.disciplina.domain;

import br.com.brain.aula.domain.Aula;
import br.com.brain.avaliacao.domain.Avaliacao;
import br.com.brain.grupo.domain.GrupoDisciplina;
import br.com.brain.serie.domain.Serie;
import br.com.brain.shared.domain.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "disciplinas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Disciplina extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", referencedColumnName = "id")
    private Serie serie;

    private String nome;

    @Column(name = "carga_horaria")
    private int cargaHoraria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_id", referencedColumnName = "id")
    private GrupoDisciplina grupo;

    @NotAudited
    @OneToMany(mappedBy = "disciplina", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Aula> aulas;

    @NotAudited
    @OneToMany(mappedBy = "disciplina", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Avaliacao> avaliacoes;
}
