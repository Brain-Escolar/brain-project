package br.com.brain.comunicado.models;

import java.io.Serializable;

import lombok.Data;

@Data
public class ComunicadoUsuarioId implements Serializable {
    private Long comunicadoId;
    private Long usuarioId;
}
