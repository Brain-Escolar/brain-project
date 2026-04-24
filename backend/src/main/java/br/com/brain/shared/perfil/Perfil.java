package br.com.brain.shared.perfil;

import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.shared.enums.PerfilNome;
import br.com.brain.shared.domain.EntidadeBase;
import br.com.brain.alerta.domain.AlertaUsuario;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;
import org.springframework.security.core.GrantedAuthority;

@Entity
@Audited
@Table(name = "perfis")
@Data
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class Perfil extends EntidadeBase implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PerfilNome nome;

    @NotAudited
    @JsonIgnore
    @ManyToMany(mappedBy = "perfis", fetch = FetchType.LAZY)
    private List<DadosPessoais> dadosPessoais = new ArrayList<>();

    @NotAudited
    @OneToMany(mappedBy = "perfil", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<AlertaUsuario> alertasUsuario = new ArrayList<>();

    @Override
    public String getAuthority() {
        return "ROLE_" + nome;
    }

    @Override
    public String toString() {
        return nome.toString();
    }
}
