package br.com.brain.configuracaoAcademica;

import br.com.brain.enums.TipoEscala;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Escala de avaliação configurável por escola/ano letivo (ex.: 0–10, 0–100).
 * Define o espaço numérico das notas, o valor de aprovação e o arredondamento.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EscalaAvaliacao {

    @Enumerated(EnumType.STRING)
    @Column(name = "escala_tipo", nullable = false)
    private TipoEscala tipo;

    @Column(name = "escala_min", nullable = false)
    private BigDecimal valorMinimo;

    @Column(name = "escala_max", nullable = false)
    private BigDecimal valorMaximo;

    @Column(name = "escala_valor_aprovacao", nullable = false)
    private BigDecimal valorAprovacao;

    @Column(name = "escala_casas_decimais", nullable = false)
    private Integer casasDecimais;

    @Column(name = "escala_label")
    private String label;
}
