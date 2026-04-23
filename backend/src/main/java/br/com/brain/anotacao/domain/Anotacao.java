package br.com.brain.anotacao.domain;

import br.com.brain.shared.domain.EntidadeBase;
import br.com.brain.aluno.domain.Aluno;
import br.com.brain.aula.domain.Aula;
import br.com.brain.shared.enums.Anotacoes;
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
import org.hibernate.envers.Audited;

import java.time.LocalDate;

@Entity
@Audited
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
