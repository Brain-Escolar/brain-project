package br.com.brain.domain.comunicado;

import java.io.Serializable;

import lombok.Data;

@Data
public class ComunicadoUsuarioId implements Serializable {
    private Long comunicadoId;
    private Long usuarioId;
}
