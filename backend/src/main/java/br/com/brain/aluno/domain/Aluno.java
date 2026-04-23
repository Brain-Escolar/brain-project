package br.com.brain.aluno.domain;

import br.com.brain.shared.domain.EntidadeBase;
import br.com.brain.anotacao.domain.Anotacao;
import br.com.brain.chamada.domain.Chamada;
import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.notas.domain.Notas;
import br.com.brain.responsavel.domain.Responsavel;
import br.com.brain.serie.domain.Serie;
import br.com.brain.turma.domain.Turma;
import br.com.brain.unidade.domain.Unidade;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Audited
@Table(name = "alunos")
@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class Aluno extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidade_id", referencedColumnName = "id")
    private Unidade unidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serie_id", referencedColumnName = "id")
    private Serie serie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turma_id", referencedColumnName = "id")
    private Turma turma;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "dados_pessoais_id", referencedColumnName = "id")
    private DadosPessoais dadosPessoais;

    private Boolean matriculado = false;

    @NotAudited
    @OneToMany(mappedBy = "aluno", fetch = FetchType.LAZY)
    private List<Anotacao> anotacoes;

    @NotAudited
    @OneToMany(mappedBy = "aluno", fetch = FetchType.LAZY)
    private List<Notas> notas;

    @NotAudited
    @ManyToMany(mappedBy = "alunos", fetch = FetchType.LAZY)
    private List<Responsavel> responsaveis = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "aluno")
    private List<Chamada> chamadas;
}
