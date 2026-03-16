package br.com.brain.domain.arquivo;

import java.util.List;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.laudoMedico.LaudoMedico;
import br.com.brain.domain.planejamentoAnual.PlanejamentoAnual;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.envers.NotAudited;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "arquivos")
@Data
@EqualsAndHashCode(callSuper = false)
public class Arquivo extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "s3_key")
    private String s3Key;

    private String nomeOriginal;

    private String contentType;

    private Long tamanho;

    @NotAudited
    @OneToMany(mappedBy = "arquivo", fetch = FetchType.LAZY)
    private List<LaudoMedico> laudos;

    @NotAudited
    @OneToMany(mappedBy = "arquivo", fetch = FetchType.LAZY)
    private List<PlanejamentoAnual> planejamentosAnuais;
}
