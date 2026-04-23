package br.com.brain.evento.domain;

import br.com.brain.shared.domain.EntidadeBase;
import br.com.brain.avaliacao.domain.Avaliacao;
import br.com.brain.professor.domain.Professor;
import br.com.brain.serie.domain.Serie;
import br.com.brain.turma.domain.Turma;
import br.com.brain.unidade.domain.Unidade;
import br.com.brain.shared.enums.TipoEvento;
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
@Table(name = "eventos")
@Data
@EqualsAndHashCode(callSuper = false)
public class Evento extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    private String descricao;

    @Column(name = "data_evento")
    private LocalDate dataEvento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo")
    private TipoEvento tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id", referencedColumnName = "id")
    private Turma turma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", referencedColumnName = "id")
    private Serie serie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", referencedColumnName = "id")
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", referencedColumnName = "id")
    private Professor professor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avaliacao_id", referencedColumnName = "id")
    private Avaliacao avaliacao;
}
