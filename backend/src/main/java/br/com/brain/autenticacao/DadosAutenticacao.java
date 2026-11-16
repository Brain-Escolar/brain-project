package br.com.brain.autenticacao;

import br.com.brain.comunicado.ComunicadoUsuario;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.perfil.Perfil;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Table(name = "dados_autenticacao")
@Entity(name = "DadosAutenticacao")
@Audited
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id", callSuper = false)
public class DadosAutenticacao extends EntidadeBase implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String senha;

    private Boolean verificado;
    private String token;
    private LocalDateTime expiracaoToken;
    private Boolean ativo;

    /** Por que o login está desligado; nulo quando ativo ou aguardando verificação (D47). */
    @Enumerated(EnumType.STRING)
    @Column(name = "motivo_desativacao")
    private MotivoDesativacao motivoDesativacao;

    /** Código de uso único do link de definir ou redefinir senha (D48). */
    @Column(name = "token_senha")
    private String tokenSenha;

    @Column(name = "expiracao_token_senha")
    private LocalDateTime expiracaoTokenSenha;

    private String googleAccessToken;
    private String googleRefreshToken;
    private LocalDateTime googleTokenExpiracao;
    private String googleId;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "dados_pessoais_id", referencedColumnName = "id")
    private DadosPessoais dadosPessoais;

    @NotAudited
    @OneToMany(mappedBy = "usuarioId", fetch = FetchType.LAZY)
    private List<ComunicadoUsuario> comunicadosRecebidos;

    public DadosAutenticacao(List<Perfil> perfis, String email, String senhaCriptografada, Perfil perfil) {
        this.email = email;
        this.senha = senhaCriptografada;
        this.verificado = false;
        this.token = UUID.randomUUID().toString();
        this.expiracaoToken = null;
        this.ativo = false;
        perfis.add(perfil);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.dadosPessoais.getPerfis();
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    public String getSocialName() {
        var nomeSocial = this.dadosPessoais.getNomeSocial();
        return (nomeSocial != null && !nomeSocial.isBlank()) ? nomeSocial : this.dadosPessoais.getNome();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.ativo;
    }

    /**
     * Confirma o e-mail. Um login desligado continua desligado: o link de
     * verificação não pode desfazer uma desativação (F4).
     */
    public void verificar() {
        this.verificado = true;
        this.ativo = this.motivoDesativacao == null;
        this.token = null;
        this.expiracaoToken = null;
    }

    /** A pessoa ficou sem papel nenhum. Não troca uma desativação administrativa. */
    public void desativarSemPerfil() {
        this.ativo = false;
        if (this.motivoDesativacao == null) {
            this.motivoDesativacao = MotivoDesativacao.SEM_PERFIL;
        }
    }

    /** Pela tela de Usuários. Vale mesmo para quem ainda não verificou. */
    public void desativarAdministrativamente() {
        this.ativo = false;
        this.motivoDesativacao = MotivoDesativacao.ADMINISTRATIVA;
        resetarTokenSenha();
    }

    /**
     * Desfaz a desativação do motivo informado. Quem ainda não verificou volta
     * a aguardar a verificação, sem entrar.
     */
    public boolean reativar(MotivoDesativacao motivo) {
        if (this.motivoDesativacao != motivo) {
            return false;
        }
        this.motivoDesativacao = null;
        this.ativo = Boolean.TRUE.equals(this.verificado);
        return true;
    }

    public SituacaoLogin getSituacao() {
        if (this.motivoDesativacao != null) {
            return SituacaoLogin.DESATIVADO;
        }
        if (!Boolean.TRUE.equals(this.verificado)) {
            return SituacaoLogin.AGUARDANDO_VERIFICACAO;
        }
        return Boolean.TRUE.equals(this.ativo) ? SituacaoLogin.ATIVO : SituacaoLogin.DESATIVADO;
    }

    public void gerarTokenSenha(String codigo, LocalDateTime expiracao) {
        this.tokenSenha = codigo;
        this.expiracaoTokenSenha = expiracao;
    }

    public void resetarTokenSenha() {
        this.tokenSenha = null;
        this.expiracaoTokenSenha = null;
    }

    /** Sem senha nem tokens: o toString vai parar em log. */
    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", verificado=" + verificado +
                ", ativo=" + ativo +
                ", motivoDesativacao=" + motivoDesativacao +
                '}';
    }

    public void gerarToken(int minutos) {
        this.token = UUID.randomUUID().toString();
        this.expiracaoToken = LocalDateTime.now().plusMinutes(minutos);
    }

    public void resetarToken() {
        this.token = null;
        this.expiracaoToken = null;
    }

    
}
