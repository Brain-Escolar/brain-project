package br.com.brain.horario.domain;

import br.com.brain.disponibilidadeProfessor.domain.DisponibilidadeProfessor;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import br.com.brain.shared.domain.EntidadeBase;
import br.com.brain.aula.domain.Aula;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "horarios")
@Data
@EqualsAndHashCode(callSuper = false)
public class Horario extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(name = "horario_inicio")
    private LocalTime horarioInicio;

    @Column(name = "horario_fim")
    private LocalTime horarioFim;

    @NotAudited
    @OneToMany(mappedBy = "horario", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DisponibilidadeProfessor> disponibilidades = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "horario", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Aula> aulas = new ArrayList<>();
}
