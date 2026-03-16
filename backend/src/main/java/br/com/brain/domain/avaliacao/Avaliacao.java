package br.com.brain.domain.avaliacao;

import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.notas.Notas;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.envers.NotAudited;

import br.com.brain.domain.EntidadeBase;
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
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "avaliacoes")
@Data
@EqualsAndHashCode(callSuper = false)
public class Avaliacao extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id", referencedColumnName = "id")
    private Disciplina disciplina;

    @Column(name = "peso")
    private BigDecimal peso;

    private String conteudo;

    @Column(name = "nota_extra")
    private Boolean notaExtra = false;

    @NotAudited
    @OneToMany(mappedBy = "avaliacao", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Notas> notas = new ArrayList<>();
}
