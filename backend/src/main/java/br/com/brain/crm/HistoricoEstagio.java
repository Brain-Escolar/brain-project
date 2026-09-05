package br.com.brain.crm;

import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.time.Instant;

@Entity
@Audited
@Table(name = "historico_estagios")
@Data
@EqualsAndHashCode(callSuper = false)
public class HistoricoEstagio extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id", referencedColumnName = "id")
    private ProcessoMatricula processo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estagio_id", referencedColumnName = "id")
    private FunilEstagio estagio;

    @Column(name = "data_entrada")
    private Instant dataEntrada;

    @Column(name = "data_saida")
    private Instant dataSaida;
}
