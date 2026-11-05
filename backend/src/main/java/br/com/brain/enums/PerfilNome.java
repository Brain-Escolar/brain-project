package br.com.brain.enums;

public enum PerfilNome {
    ADMIN,
    ESTUDANTE,
    PROFESSOR,
    SECRETARIO,
    DIRETOR,
    COORDENADOR,
    RECURSOS_HUMANOS,
    ORIENTADOR,
    RESPONSAVEL,

    /**
     * Quem cuida do dinheiro: contrato, carne, baixa, inadimplencia e bolsa.
     *
     * Entra por ultimo de proposito. `perfis` e espelhada por enums fechados dos
     * dois lados -- aqui e em UserRoleEnum/PerfilNomeEnum no frontend -- e uma
     * linha no banco que os enums nao conhecem faz a pessoa logar sem menu, sem
     * rota e sem permissao, porque parseRoles() descarta o que nao reconhece.
     * Por isso a V119 insere a linha SO agora, junto do codigo que a reconhece.
     */
    FINANCEIRO,
}
