package br.com.brain.domain.dependente;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.GrauParentesco;
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
@Table(name = "dependentes")
@Data
@EqualsAndHashCode(callSuper = false)
public class Dependente extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", nullable = false)
    private DadosPessoais responsavel;

    private String nome;

    private String cpf;

    @Column(name = "data_de_nascimento")
    private LocalDate dataDeNascimento;

    @Enumerated(EnumType.STRING)
    @Column(name = "grau_parentesco")
    private GrauParentesco grauParentesco;

    @Column(name = "possui_deficiencia")
    private Boolean possuiDeficiencia = false;
}
