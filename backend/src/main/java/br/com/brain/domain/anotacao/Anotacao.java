package br.com.brain.domain.anotacao;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.aula.Aula;
import br.com.brain.enums.Anotacoes;
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
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "anotacoes")
@Data
@EqualsAndHashCode(callSuper = false)
public class Anotacao extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aula_id", referencedColumnName = "id")
    private Aula aula;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_anotacao", nullable = false)
    private Anotacoes tipoAnotacao;

    @Column(name = "data_anotacao")
    private LocalDate dataAnotacao;

    private String observacao;
}
