package br.com.brain.usuario.gestao.dto;

import br.com.brain.autenticacao.MotivoDesativacao;
import br.com.brain.autenticacao.SituacaoLogin;
import br.com.brain.enums.PerfilNome;

import java.util.List;

/**
 * Uma linha da lista de Usuários: uma pessoa com login (U6).
 *
 * perfisComAcessoIndividual: perfis em que a pessoa tem acesso individual.
 * perfisSemAcesso: perfis em que ela não tem grupo ativo nem acesso individual,
 * e por isso não abre nenhuma tela (D2, D15). O ADMIN nunca entra aqui.
 */
public record UsuarioListaDto(
        Long dadosPessoaisId,
        String nome,
        String nomeSocial,
        String email,
        List<PerfilNome> perfis,
        List<GrupoDoUsuarioDto> grupos,
        List<PerfilNome> perfisComAcessoIndividual,
        List<PerfilNome> perfisSemAcesso,
        SituacaoLogin situacao,
        MotivoDesativacao motivoDesativacao) {
}
