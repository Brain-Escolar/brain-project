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

import java.time.Instant;
import java.time.LocalDate;

/**
 * Período letivo configurável por ano (bimestre, trimestre, semestre, anual, ...).
 * Cada avaliação de turma aponta para o seu período; o intervalo
 * [dataInicio, dataFim] aloca as chamadas e a data de referência das notas.
 * Fechado ({@code fechadoEm} preenchido), não aceita mais nota nem chamada.
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

    @Column(name = "fechado_em")
    private Instant fechadoEm;

    public boolean isFechado() {
        return fechadoEm != null;
    }

    /**
     * A data informada trazida para dentro do período: a de referência de uma
     * nota que conta para este período, mesmo que a prova tenha sido aplicada
     * fora dele (recuperação).
     */
    public LocalDate trazerParaDentro(LocalDate data) {
        if (data == null || data.isBefore(dataInicio)) {
            return dataInicio;
        }
        return data.isAfter(dataFim) ? dataFim : data;
    }

    /** Indica se a data informada cai dentro deste período (limites inclusivos). */
    public boolean contem(LocalDate data) {
        return data != null && !data.isBefore(dataInicio) && !data.isAfter(dataFim);
    }
}
