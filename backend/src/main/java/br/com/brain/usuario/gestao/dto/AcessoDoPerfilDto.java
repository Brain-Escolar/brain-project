package br.com.brain.usuario.gestao.dto;

import br.com.brain.enums.PerfilNome;

import java.util.List;

/**
 * O que a pessoa abre num perfil. grupos traz os grupos normais dela no
 * perfil, inclusive os inativos, que aparecem marcados e não somam. Para o
 * ADMIN, tetoDoAdmin é verdadeiro e não há grupo: ele recebe o teto (RP4).
 * servidor é o que o perfil abre direto, fora dos grupos (D26).
 */
public record AcessoDoPerfilDto(
        PerfilNome perfil,
        boolean tetoDoAdmin,
        List<GrupoDoUsuarioDto> grupos,
        boolean acessoIndividual,
        List<TelaEfetivaDto> telas,
        List<ControleEfetivoDto> controles,
        List<AreaDiretaDto> servidor) {
}
