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

/** Tela concedida a um grupo. Só é criada ou removida; a remoção fica no Envers. */
@Entity
@Audited
@Table(name = "grupos_usuarios_telas")
@Getter
@NoArgsConstructor
public class GrupoUsuarioTela extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "grupo_usuario_id")
    private GrupoUsuario grupoUsuario;

    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tela_id")
    private Tela tela;

    public GrupoUsuarioTela(GrupoUsuario grupoUsuario, Tela tela) {
        this.grupoUsuario = grupoUsuario;
        this.tela = tela;
    }
}
