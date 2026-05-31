package br.com.brain.comunicado;

import java.io.Serializable;

import lombok.Data;

@Data
public class ComunicadoUsuarioId implements Serializable {
    private Long comunicadoId;
    private Long usuarioId;
}
