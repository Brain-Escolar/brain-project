package br.com.brain.alerta.domain;

import java.io.Serializable;

import lombok.Data;

@Data
public class AlertaUsuarioId implements Serializable {
    private Long alerta;
    private Long usuario;
    private Long perfil;
}
