package br.com.brain.usuario.gestao.dto;

/**
 * O que quem está vendo pode fazer com o login desta pessoa agora. A tela usa
 * para mostrar os botões; o servidor confere de novo em cada ação.
 *
 * bloqueio explica por que nada pode ser feito (sem o controle, o próprio
 * login, fora do alcance). Nulo quando as ações dependem só da situação.
 */
public record AcoesLoginDto(
        boolean desativar,
        boolean reativar,
        boolean reenviarVerificacao,
        boolean enviarRedefinicao,
        String bloqueio) {
}
