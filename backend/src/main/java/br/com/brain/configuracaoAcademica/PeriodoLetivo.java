package br.com.brain.configuracaoAcademica;

import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * Período letivo configurável por ano (bimestre, trimestre, semestre, anual, ...).
 * O intervalo [dataInicio, dataFim] é usado para alocar cada nota
 * (via {@code periodo_referencia}) e cada chamada ao período correto nos relatórios.
 */
@Entity
@Table(name = "periodos_letivos")
@Data
@EqualsAndHashCode(callSuper = false, of = "id")
public class PeriodoLetivo extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ano_letivo", nullable = false)
    private Integer anoLetivo;

    private String nome;

    private Integer sequencia;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    /** Indica se a data informada cai dentro deste período (limites inclusivos). */
    public boolean contem(LocalDate data) {
        return data != null && !data.isBefore(dataInicio) && !data.isAfter(dataFim);
    }
}
