package br.com.brain.grupo.domain;

import br.com.brain.disciplina.domain.Disciplina;
import br.com.brain.shared.domain.EntidadeBase;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.List;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "grupos_disciplinas")
@Data
@EqualsAndHashCode(callSuper = false)
public class GrupoDisciplina extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String area;

    @NotAudited
    @OneToMany(mappedBy = "grupo")
    private List<Disciplina> disciplinas;
}
