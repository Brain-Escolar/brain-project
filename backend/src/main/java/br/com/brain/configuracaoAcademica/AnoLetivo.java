package br.com.brain.configuracaoAcademica;

import br.com.brain.enums.StatusAnoLetivo;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Ano letivo da escola. A chave é o próprio ano (2026): é assim que turmas,
 * matrículas e períodos já se referem a ele.
 */
@Entity
@Audited
@Table(name = "anos_letivos")
@Data
@EqualsAndHashCode(callSuper = false, of = "ano")
public class AnoLetivo extends EntidadeBase {

    @Id
    private Integer ano;

    @Enumerated(EnumType.STRING)
    private StatusAnoLetivo status = StatusAnoLetivo.PLANEJAMENTO;

    @Column(name = "data_inicio")
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(name = "aberto_em")
    private Instant abertoEm;

    @Column(name = "encerrado_em")
    private Instant encerradoEm;

    public boolean isEncerrado() {
        return status == StatusAnoLetivo.ENCERRADO;
    }
}
