package br.com.brain.usuario.gestao.dto;

import br.com.brain.permissao.AcessoDiretoDoPerfil;

/** Área que o perfil abre direto no servidor, sem grupo (D26). */
public record AreaDiretaDto(String nome, String detalhe, boolean sensivel) {

    public static AreaDiretaDto de(AcessoDiretoDoPerfil.Area area) {
        return new AreaDiretaDto(area.nome(), area.detalhe(), area.sensivel());
    }
}
