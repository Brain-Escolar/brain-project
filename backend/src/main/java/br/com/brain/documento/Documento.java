package br.com.brain.documento;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.StatusDocumento;
import br.com.brain.enums.TipoDocumento;
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
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.envers.Audited;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Documento de uma pessoa (aluno ou responsavel), sujeito a validacao da
 * secretaria. Um registro por pessoa/tipo - ver V106.
 */
@Entity
@Audited
@Table(name = "documentos")
@Data
@EqualsAndHashCode(callSuper = false, exclude = { "dadosPessoais", "validadoPor", "arquivos" })
@ToString(exclude = { "dadosPessoais", "validadoPor", "arquivos" })
public class Documento extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dados_pessoais_id", nullable = false)
    private DadosPessoais dadosPessoais;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDocumento tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusDocumento status;

    private String motivoRejeicao;

    private LocalDate dataValidade;

    @Column(nullable = false)
    private Instant enviadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validado_por")
    private DadosPessoais validadoPor;

    private Instant validadoEm;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "documentos_arquivos", joinColumns = @JoinColumn(name = "documento_id"), inverseJoinColumns = @JoinColumn(name = "arquivo_id"))
    private List<Arquivo> arquivos = new ArrayList<>();

    /** Novo envio (primeiro ou reenvio): troca os arquivos e volta para a fila. */
    public void registrarEnvio(List<Arquivo> novosArquivos) {
        this.arquivos.clear();
        this.arquivos.addAll(novosArquivos);
        this.status = StatusDocumento.EM_ANALISE;
        this.enviadoEm = Instant.now();
        this.motivoRejeicao = null;
        this.dataValidade = null;
        this.validadoPor = null;
        this.validadoEm = null;
    }

    public void aprovar(DadosPessoais validador, LocalDate dataValidade) {
        this.status = StatusDocumento.APROVADO;
        this.dataValidade = dataValidade;
        this.motivoRejeicao = null;
        this.validadoPor = validador;
        this.validadoEm = Instant.now();
    }

    public void rejeitar(DadosPessoais validador, String motivo) {
        this.status = StatusDocumento.REJEITADO;
        this.motivoRejeicao = motivo;
        this.validadoPor = validador;
        this.validadoEm = Instant.now();
    }

    public boolean isVencido() {
        return dataValidade != null && dataValidade.isBefore(LocalDate.now());
    }

    /** Conta como entregue: aprovado e dentro da validade. */
    public boolean isValido() {
        return status == StatusDocumento.APROVADO && !isVencido();
    }
}
