package br.com.brain.crm;

import br.com.brain.aluno.Aluno;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.StatusProcessoMatricula;
import br.com.brain.enums.TipoProcessoMatricula;
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
@Table(name = "processos_matricula")
@Data
@EqualsAndHashCode(callSuper = false)
public class ProcessoMatricula extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", referencedColumnName = "id")
    private Aluno aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origem_id", referencedColumnName = "id")
    private OrigemLead origem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estagio_atual_id", referencedColumnName = "id")
    private FunilEstagio estagioAtual;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcionario_id", referencedColumnName = "id")
    private DadosPessoais funcionario;

    @Enumerated(EnumType.STRING)
    private TipoProcessoMatricula tipo;

    @Enumerated(EnumType.STRING)
    private StatusProcessoMatricula status = StatusProcessoMatricula.ATIVO;

    private String subestagio;

    @Column(name = "ano_letivo")
    private Integer anoLetivo;

    @Column(name = "responsavel_nome")
    private String responsavelNome;

    @Column(name = "responsavel_telefone")
    private String responsavelTelefone;

    @Column(name = "motivo_perda")
    private String motivoPerda;

    @Column(name = "data_conclusao")
    private Instant dataConclusao;
}
