package br.com.brain.domain.autenticacao;

import br.com.brain.domain.comunicado.ComunicadoUsuario;
import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.perfil.Perfil;
import br.com.brain.domain.EntidadeBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
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

import org.hibernate.envers.NotAudited;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Table(name = "dados_autenticacao")
@Entity(name = "DadosAutenticacao")
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
        return this.dadosPessoais.getNomeSocial();
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

    public void verificar() {
        this.verificado = true;
        this.ativo = true;
        this.token = null;
        this.expiracaoToken = null;
    }

    public void desativar() {
        this.ativo = false;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", senha='" + senha + '\'' +
                ", verificado=" + verificado +
                ", token='" + token + '\'' +
                ", expiracaoToken=" + expiracaoToken +
                ", ativo=" + ativo +
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
