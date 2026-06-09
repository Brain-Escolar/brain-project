package br.com.brain.alerta.dto;

import br.com.brain.alerta.AlertaUsuario;

import java.time.LocalDate;

public record AlertaUsuarioListagemDto(
        Long id,
        String titulo,
        String conteudo,
        LocalDate data,
        boolean lido) {

    public AlertaUsuarioListagemDto(AlertaUsuario alertaUsuario) {
        this(
                alertaUsuario.getAlerta().getId(),
                alertaUsuario.getAlerta().getTitulo(),
                alertaUsuario.getAlerta().getConteudo(),
                alertaUsuario.getAlerta().getData(),
                alertaUsuario.isLido());
    }
}
