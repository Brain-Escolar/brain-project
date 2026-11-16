package br.com.brain.usuario.gestao.dto;

import br.com.brain.autenticacao.SituacaoLogin;
import br.com.brain.enums.PerfilNome;

/** Filtros da lista de Usuários. Todos opcionais; combinam com "e". */
public record FiltroUsuariosDto(
        String busca,
        PerfilNome perfil,
        Long grupoId,
        SituacaoLogin situacao,
        Boolean semAcesso,
        Boolean comAcessoIndividual) {
}
