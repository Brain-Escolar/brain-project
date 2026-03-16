package br.com.brain.domain.dadosPessoais;

import br.com.brain.domain.endereco.Endereco;
import br.com.brain.domain.fichamedica.FichaMedica;
import br.com.brain.domain.grupo.GrupoDisciplina;
import br.com.brain.domain.horario.Horario;
import br.com.brain.domain.notas.Notas;
import br.com.brain.domain.orientador.Orientador;
import br.com.brain.domain.perfil.Perfil;
import br.com.brain.domain.professor.Professor;
import br.com.brain.domain.responsavel.Responsavel;
import br.com.brain.domain.rh.Rh;
import br.com.brain.domain.secretario.Secretario;
import br.com.brain.domain.serie.Serie;
import br.com.brain.domain.tarefa.Tarefa;
import br.com.brain.domain.telefone.Telefone;
import br.com.brain.domain.turma.Turma;
import br.com.brain.domain.unidade.Unidade;
import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.alerta.Alerta;
import br.com.brain.domain.alerta.AlertaUsuario;
import br.com.brain.domain.aluno.Aluno;
import br.com.brain.domain.anotacao.Anotacao;
import br.com.brain.domain.arquivo.Arquivo;
import br.com.brain.domain.aula.Aula;
import br.com.brain.domain.autenticacao.DadosAutenticacao;
import br.com.brain.domain.avaliacao.Avaliacao;
import br.com.brain.domain.chamada.Chamada;
import br.com.brain.domain.comunicado.Comunicado;
import br.com.brain.domain.conteudo.Conteudo;
import br.com.brain.domain.coordenador.Coordenador;
import br.com.brain.domain.diretor.Diretor;
import br.com.brain.domain.disciplina.Disciplina;
import br.com.brain.domain.disponibilidadeProfessor.DisponibilidadeProfessor;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Embedded;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonGetter;
import org.hibernate.envers.NotAudited;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "dados_pessoais")
@Data
@EqualsAndHashCode(callSuper = false, exclude = { "professor", "aluno", "responsavel", "rhs", "diretores",
        "coordenadores", "orientadores", "secretarios" })
public class DadosPessoais extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cpf;
    private String rg;
    private String matricula;
    private String nome;

    @Column(name = "nome_social")
    private String nomeSocial;

    private String email;

    @Column(name = "email_profissional")
    private String emailProfissional;

    @Column(name = "data_de_nascimento")
    private LocalDate dataDeNascimento;

    @Embedded
    private Endereco endereco;
    private String genero;

    @Column(name = "cidade_naturalidade")
    private String cidadeNaturalidade;

    @Column(name = "cor_raca")
    private String corRaca;

    @Column(name = "carteira_de_trabalho")
    private String carteiraDeTrabalho;

    @NotAudited
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "dados_pessoais_perfis", joinColumns = @JoinColumn(name = "dados_pessoais_id"), inverseJoinColumns = @JoinColumn(name = "perfil_id"))
    private List<Perfil> perfis = new ArrayList<>();

    @NotAudited
    @JsonIgnore
    @OneToMany(mappedBy = "dadosPessoaisId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Telefone> telefones;

    @JsonGetter("telefones")
    public List<String> getTelefonesNumeros() {
        if (telefones == null || telefones.isEmpty()) {
            return new ArrayList<>();
        }
        return telefones.stream()
                .map(Telefone::getNumero)
                .collect(Collectors.toList());
    }

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Turma> turmasAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Unidade> unidadesAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Serie> serieAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Alerta> alertaAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Avaliacao> avaliacaoAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Secretario> secretarioAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<FichaMedica> fichaMedicaAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Orientador> orientadorAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<GrupoDisciplina> grupoDisciplinaAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Horario> horariosAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Responsavel> responsaveisAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Aluno> alunosAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Rh> RhAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Diretor> diretorAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Tarefa> tarefaAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Comunicado> comunicadoAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DadosPessoais> dadosPessoaisAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Professor> professorAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Coordenador> coordenadorAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Aula> aulaAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Arquivo> arquivosAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Chamada> chamadaAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Disciplina> disciplinaAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Perfil> perfilAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Conteudo> conteudoAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DadosAutenticacao> dadosAutenticacaoAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DisponibilidadeProfessor> disponibilidadeProfessorAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Telefone> telefoneAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Notas> notasAtualizadoPor = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "atualizadoPor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Anotacao> anotacoesAtualizadoPor = new ArrayList<>();

    @OneToOne(mappedBy = "dadosPessoais", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private FichaMedica fichaMedica;

    @NotAudited
    @OneToMany(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Rh> rhs = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Diretor> diretores = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Coordenador> coordenadores = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Orientador> orientadores = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Secretario> secretarios = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "usuario", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<AlertaUsuario> alertasUsuario = new ArrayList<>();

    @OneToOne(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private Responsavel responsavel;

    @OneToOne(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private Aluno aluno;

    @OneToOne(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private Professor professor;

    @OneToOne(mappedBy = "dadosPessoais", fetch = FetchType.LAZY)
    @JsonIgnore
    private DadosAutenticacao dadosAutenticacao;

    public void atualizarCpf(String cpf) {
        if (cpf != null && !cpf.isBlank()) {
            this.cpf = cpf;
        }
    }

    public void atualizarRg(String rg) {
        if (rg != null && !rg.isBlank()) {
            this.rg = rg;
        }
    }

    public void atualizarNome(String nome) {
        if (nome != null && !nome.isBlank()) {
            this.nome = nome;
        }
    }

    public void atualizarNomeSocial(String nomeSocial) {
        if (nomeSocial != null && !nomeSocial.isBlank()) {
            this.nomeSocial = nomeSocial;
        }
    }

    public void atualizarEmail(String email) {
        if (email != null && !email.isBlank()) {
            this.email = email;
        }
    }

    public void atualizarDataDeNascimento(LocalDate dataDeNascimento) {
        if (dataDeNascimento != null) {
            this.dataDeNascimento = dataDeNascimento;
        }
    }

    public void atualizarEndereco(Endereco endereco) {
        if (endereco != null) {
            this.endereco = endereco;
        }
    }

    public void atualizarGenero(String genero) {
        if (genero != null && !genero.isBlank()) {
            this.genero = genero;
        }
    }

    public void atualizarCorRaca(String corRaca) {
        if (corRaca != null && !corRaca.isBlank()) {
            this.corRaca = corRaca;
        }
    }

    public void atualizarCarteiraDeTrabalho(String carteiraDeTrabalho) {
        if (carteiraDeTrabalho != null && !carteiraDeTrabalho.isBlank()) {
            this.carteiraDeTrabalho = carteiraDeTrabalho;
        }
    }

    public void adicionarPerfil(Perfil perfil) {
        this.perfis.add(perfil);
    }

    public void setTelefones(List<String> numeros) {
        this.telefones = new ArrayList<>();
        for (String numero : numeros) {
            Telefone telefone = new Telefone();
            telefone.setNumero(numero);
            telefone.setDadosPessoaisId(this);
            this.telefones.add(telefone);
        }
    }
}
