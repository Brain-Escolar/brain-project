package br.com.brain.professor.domain;

import br.com.brain.aula.domain.Aula;
import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.disponibilidadeProfessor.domain.DisponibilidadeProfessor;
import br.com.brain.escolaridade.domain.Escolaridade;
import br.com.brain.grupo.domain.GrupoDisciplina;
import br.com.brain.tarefa.domain.Tarefa;
import br.com.brain.shared.domain.EntidadeBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

@Entity
@Audited
@Table(name = "professores")
@Data
@EqualsAndHashCode(callSuper = false, exclude = { "dadosPessoais", "aulas", "tarefas", "disponibilidades" })
public class Professor extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "dados_pessoais_id", referencedColumnName = "id")
    private DadosPessoais dadosPessoais;

    private Boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grupo_disciplina_id")
    private GrupoDisciplina grupoDisciplina;

    @Column(name = "titulo_eleitor")
    private String tituloEleitor;

    @Column(name = "pis_pasep")
    private String pisPasep;

    private String reservista;

    @Column(name = "codigo_banco")
    private String codigoBanco;

    private String agencia;

    private String conta;

    @Column(name = "exame_admissional")
    private Boolean exameAdmissional = false;

    @Column(name = "consentimento_lgpd")
    private Boolean consentimentoLgpd = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escolaridade_id")
    private Escolaridade escolaridade;

    @NotAudited
    @OneToMany(mappedBy = "professor", fetch = FetchType.LAZY)
    private List<Aula> aulas;

    @NotAudited
    @OneToMany(mappedBy = "professor", fetch = FetchType.LAZY)
    private List<Tarefa> tarefas;

    @NotAudited
    @OneToMany(mappedBy = "professor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DisponibilidadeProfessor> disponibilidades = new ArrayList<>();

}
