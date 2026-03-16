package br.com.brain.domain.gradeCurricular;

import br.com.brain.domain.EntidadeBase;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "grades_curriculares")
@Data
@EqualsAndHashCode(callSuper = false)
public class GradeCurricular extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String versao;

    private Boolean ativo;
}
