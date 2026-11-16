package br.com.brain.usuario.gestao.dto;

import br.com.brain.enums.PerfilNome;

import java.util.List;

/**
 * O que acontece ao conceder ou remover um perfil, para o diálogo de
 * confirmação (RU3, RU9, RU10). bloqueio, quando preenchido, diz por que a
 * ação não pode ser feita.
 *
 * Na concessão: gruposQueVoltam são os grupos que a pessoa já tinha no perfil
 * (ela não entra no padrão, para a restrição não se perder: RU3);
 * grupoPadrao, o grupo em que ela vai entrar quando não tinha nenhum;
 * acessoIndividualVolta, se um acesso individual antigo volta a valer;
 * criaCadastroSecretario, se o registro do CRM vai ser criado (RU9).
 *
 * Na remoção: ultimaComPerfil avisa que ninguém mais com login ativo fica no
 * perfil (conversas e alertas vão para o perfil); leadsAtivos, quantos leads
 * do CRM estão com a pessoa, só para SECRETARIO. Os grupos ficam guardados (RU4).
 *
 * telas, controles e servidor são o que a pessoa vai abrir no perfil (na
 * concessão) ou o que deixa de abrir (na remoção).
 */
public record PreviaPerfilDto(
        PerfilNome perfil,
        boolean concessao,
        String bloqueio,
        List<GrupoDoUsuarioDto> gruposQueVoltam,
        GrupoDoUsuarioDto grupoPadrao,
        boolean acessoIndividualVolta,
        boolean tetoDoAdmin,
        boolean criaCadastroSecretario,
        boolean ultimaComPerfil,
        Long leadsAtivos,
        List<TelaEfetivaDto> telas,
        List<ControleEfetivoDto> controles,
        List<AreaDiretaDto> servidor) {
}
