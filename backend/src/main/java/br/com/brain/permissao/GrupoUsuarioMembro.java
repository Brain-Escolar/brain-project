package br.com.brain.permissao;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;

import org.hibernate.envers.Audited;

/**
 * Pessoa num grupo. Usa dados_pessoais, como os perfis: é o id que o sistema
 * trata como usuário (criado_por, Envers, dadosPessoaisId no JWT).
 */
@Entity
@Audited
@Table(name = "dados_pessoais_grupos_usuarios")
@Getter
@NoArgsConstructor
public class GrupoUsuarioMembro extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grupo_usuario_id")
    private GrupoUsuario grupoUsuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dados_pessoais_id")
    private DadosPessoais dadosPessoais;

    public GrupoUsuarioMembro(GrupoUsuario grupoUsuario, DadosPessoais dadosPessoais) {
        this.grupoUsuario = grupoUsuario;
        this.dadosPessoais = dadosPessoais;
    }
}
