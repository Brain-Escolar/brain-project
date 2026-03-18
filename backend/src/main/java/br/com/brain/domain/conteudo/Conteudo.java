package br.com.brain.domain.conteudo;

import br.com.brain.domain.aula.Aula;
import br.com.brain.domain.EntidadeBase;
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
@Table(name = "conteudos")
@Data
@EqualsAndHashCode(callSuper = false)
public class Conteudo extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String conteudo;

    @ManyToOne
    @JoinColumn(name = "aula_id", referencedColumnName = "id")
    private Aula aula;

    @Column(name = "data_conteudo")
    private LocalDate data;
}
