package br.com.brain.chamada.domain;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.aula.domain.Aula;
import br.com.brain.shared.domain.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

import java.time.LocalDate;

@Entity
@Audited
@Table(name = "chamadas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Chamada extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "aula_id", referencedColumnName = "id")
    private Aula aula;

    @ManyToOne
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Aluno aluno;

    @Column(name = "data_chamada")
    private LocalDate data;

    private Boolean presente;
}
