package br.com.brain.comunicado.domain;

import br.com.brain.autenticacao.domain.DadosAutenticacao;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "comunicados_usuario")
@IdClass(ComunicadoUsuarioId.class)
@Data
public class ComunicadoUsuario {

    @Id
    @ManyToOne
    @JoinColumn(name = "comunicado_id")
    private Comunicado comunicadoId;

    @Id
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private DadosAutenticacao usuarioId;

    @Column(nullable = false)
    private boolean lido = false;

}
