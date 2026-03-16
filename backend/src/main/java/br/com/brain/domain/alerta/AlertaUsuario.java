package br.com.brain.domain.alerta;

import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.perfil.Perfil;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "alertas_usuarios")
@IdClass(AlertaUsuarioId.class)
@Data
public class AlertaUsuario {

    @Id
    @ManyToOne
    @JoinColumn(name = "alerta_id")
    private Alerta alerta;

    @Id
    @ManyToOne
    @JoinColumn(name = "dados_pessoais_id")
    private DadosPessoais usuario;

    @Id
    @ManyToOne
    @JoinColumn(name = "perfil_id")
    private Perfil perfil;

    @Column(nullable = false)
    private boolean lido = false;

}
