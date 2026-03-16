package br.com.brain.domain.alerta;

import java.io.Serializable;

import lombok.Data;

@Data
public class AlertaUsuarioId implements Serializable {
    private Long alerta;
    private Long usuario;
    private Long perfil;
}
