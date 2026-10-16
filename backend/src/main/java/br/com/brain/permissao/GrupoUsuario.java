package br.com.brain.permissao;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.perfil.Perfil;
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
import lombok.Setter;

import org.hibernate.envers.Audited;

/**
 * Conjunto de telas e controles concedidos a pessoas de um mesmo perfil.
 *
 * O perfil não muda depois de criado: acessos e membros dependem dele. O grupo
 * padrão (um por perfil, criado pela migration) não é excluído nem desativado.
 * Telas, controles e membros ficam em entidades próprias, sem coleção aqui:
 * cada vínculo é auditado separadamente.
 *
 * Com dadosPessoais preenchido, é o grupo individual da pessoa no perfil
 * (acessos além dos grupos dela). Ele não aparece na lista de grupos e só é
 * mexido pelos endpoints de acessos individuais; a pessoa também é membro,
 * então a permissão efetiva soma tudo pela mesma consulta.
 */
@Entity
@Audited
@Table(name = "grupos_usuarios")
@Getter
@Setter
@NoArgsConstructor
public class GrupoUsuario extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "perfil_id")
    private Perfil perfil;

    private String nome;
    private String descricao;
    private Boolean padrao;
    private Boolean ativo;

    /** Dono do grupo individual; nulo nos grupos normais. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dados_pessoais_id")
    private DadosPessoais dadosPessoais;

    public GrupoUsuario(Perfil perfil, String nome, String descricao) {
        this.perfil = perfil;
        this.nome = nome;
        this.descricao = descricao;
        this.padrao = false;
        this.ativo = true;
    }

    public static GrupoUsuario individual(Perfil perfil, DadosPessoais pessoa) {
        // O nome não aparece na tela, mas é obrigatório e único no perfil: o id
        // desempata pessoas com o mesmo nome.
        var nome = "Individual: " + pessoa.getNome();
        var sufixo = " (" + pessoa.getId() + ")";
        var grupo = new GrupoUsuario(perfil, nome.substring(0, Math.min(nome.length(), 100 - sufixo.length())) + sufixo,
                null);
        grupo.dadosPessoais = pessoa;
        return grupo;
    }
}
