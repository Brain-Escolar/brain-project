package br.com.brain.domain.fichamedica;

import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.laudoMedico.LaudoMedico;

import java.util.ArrayList;
import java.util.List;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.enums.TipoSanguineo;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.envers.NotAudited;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "fichas_medicas")
@Data
@EqualsAndHashCode(callSuper = false)
public class FichaMedica extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "dados_pessoais_id", referencedColumnName = "id", nullable = false)
    private DadosPessoais dadosPessoais;

    @Column(name = "tipo_sanguineo")
    @Enumerated(EnumType.STRING)
    private TipoSanguineo tipoSanguineo;

    @Column(name = "necessidades_especiais")
    private String necessidadesEspeciais;

    @Column(name = "doencas_respiratorias")
    private String doencasRespiratorias;

    @Column(name = "alergias_alimentares")
    private String alergiasAlimentares;

    @Column(name = "alergias_medicamentosas")
    private String alergiasMedicamentosas;

    @NotAudited
    @OneToMany(mappedBy = "fichaMedica", cascade = CascadeType.ALL)
    private List<LaudoMedico> laudos = new ArrayList<>();
}
