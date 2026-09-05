package br.com.brain.crm;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.TipoInteracao;
import br.com.brain.shared.EntidadeBase;
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

import java.time.Instant;

@Entity
@Audited
@Table(name = "interacoes")
@Data
@EqualsAndHashCode(callSuper = false)
public class Interacao extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processo_id", referencedColumnName = "id")
    private ProcessoMatricula processo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcionario_id", referencedColumnName = "id")
    private DadosPessoais funcionario;

    @Enumerated(EnumType.STRING)
    private TipoInteracao tipo;

    private String resultado;

    private String observacoes;

    @Column(name = "proxima_acao")
    private Instant proximaAcao;
}
