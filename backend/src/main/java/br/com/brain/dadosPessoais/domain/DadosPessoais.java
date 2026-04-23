package br.com.brain.dadosPessoais.domain;

import br.com.brain.shared.dependente.Dependente;
import br.com.brain.shared.endereco.Endereco;
import br.com.brain.fichamedica.domain.FichaMedica;
import br.com.brain.shared.perfil.Perfil;
import br.com.brain.professor.domain.Professor;
import br.com.brain.responsavel.domain.Responsavel;
import br.com.brain.rh.domain.Rh;
import br.com.brain.secretario.domain.Secretario;
import br.com.brain.shared.telefone.Telefone;
import br.com.brain.shared.domain.EntidadeBase;
import br.com.brain.alerta.domain.AlertaUsuario;
import br.com.brain.aluno.domain.Aluno;
import br.com.brain.autenticacao.domain.DadosAutenticacao;
import br.com.brain.coordenador.domain.Coordenador;
import br.com.brain.diretor.domain.Diretor;
import br.com.brain.orientador.domain.Orientador;
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
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Audited
@Table(name = "dados_pessoais")
@Data
@EqualsAndHashCode(callSuper = false, exclude = { "professor", "aluno", "responsavel", "rhs", "diretores",
        "coordenadores", "orientadores", "secretarios", "dependentes", "fichaMedica" })
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

    @OneToMany(mappedBy = "responsavel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Dependente> dependentes = new ArrayList<>();

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
        if (numeros == null) return;
        for (String numero : numeros) {
            Telefone telefone = new Telefone();
            telefone.setNumero(numero);
            telefone.setDadosPessoaisId(this);
            this.telefones.add(telefone);
        }
    }
}
