package br.com.brain.permissao;

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
import org.hibernate.envers.RelationTargetAuditMode;

/** Controle concedido a um grupo. Só é criado ou removido; a remoção fica no Envers. */
@Entity
@Audited
@Table(name = "grupos_usuarios_controles")
@Getter
@NoArgsConstructor
public class GrupoUsuarioControle extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grupo_usuario_id")
    private GrupoUsuario grupoUsuario;

    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "controle_id")
    private Controle controle;

    public GrupoUsuarioControle(GrupoUsuario grupoUsuario, Controle controle) {
        this.grupoUsuario = grupoUsuario;
        this.controle = controle;
    }
}
