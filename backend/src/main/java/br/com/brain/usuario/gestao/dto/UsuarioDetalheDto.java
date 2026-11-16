package br.com.brain.usuario.gestao.dto;

import br.com.brain.autenticacao.MotivoDesativacao;
import br.com.brain.autenticacao.SituacaoLogin;
import br.com.brain.enums.PerfilNome;

import java.util.List;

/**
 * Cabeçalho e login da página da pessoa na tela de Usuários.
 *
 * O e-mail pessoal vai mascarado: é para onde seguem os links de senha (D48),
 * e a tela só precisa mostrar que ele existe e reconhecível.
 */
public record UsuarioDetalheDto(
        Long dadosPessoaisId,
        String nome,
        String nomeSocial,
        String email,
        String emailPessoalMascarado,
        List<PerfilNome> perfis,
        SituacaoLogin situacao,
        MotivoDesativacao motivoDesativacao,
        List<OrigemCadastroDto> origens,
        AcoesLoginDto acoes) {
}
