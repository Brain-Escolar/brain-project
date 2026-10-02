package br.com.brain.comunicado;

import br.com.brain.enums.ComunicadoAbrangenciaEnum;
import br.com.brain.enums.ComunicadoPublicoEnum;
import br.com.brain.serie.Serie;
import br.com.brain.turma.Turma;
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

/**
 * Uma regra de público-alvo do comunicado, ex.: "responsáveis da turma 3A".
 * A turma vale para abrangência TURMA e a série para SEGMENTO; ambas são nulas em GERAL.
 */
@Entity
@Table(name = "comunicado_destinatarios")
@Data
public class ComunicadoDestinatario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comunicado_id", nullable = false)
    private Comunicado comunicado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComunicadoPublicoEnum publico;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComunicadoAbrangenciaEnum abrangencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id")
    private Turma turma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id")
    private Serie serie;
}
