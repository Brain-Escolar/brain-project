package br.com.brain.permissao.dto;

import java.time.Instant;
import java.util.List;

/**
 * Uma revisão do Envers no histórico de um grupo: tudo o que um salvamento
 * mudou de uma vez (docs/permissoes.md, seção 9.5).
 *
 * autor é nulo quando a alteração não veio de alguém logado (sistema). Na
 * criação, campos traz os valores iniciais, com antes nulo. As listas de
 * telas, controles e pessoas vêm vazias quando a revisão não mexeu nelas.
 */
public record RevisaoGrupoUsuarioDto(
        long revisao,
        Instant data,
        PessoaDto autor,
        boolean criacao,
        List<CampoAlteradoDto> campos,
        List<ItemDto> telasConcedidas,
        List<ItemDto> telasRetiradas,
        List<ItemDto> controlesConcedidos,
        List<ItemDto> controlesRetirados,
        List<PessoaDto> pessoasAdicionadas,
        List<PessoaDto> pessoasRemovidas) {

    /** campo: nome, descricao ou ativo. Valores como texto; ativo vem "true"/"false". */
    public record CampoAlteradoDto(String campo, String antes, String depois) {
    }

    /** Tela ou controle do catálogo. */
    public record ItemDto(String codigo, String nome) {
    }

    public record PessoaDto(Long dadosPessoaisId, String nome) {
    }
}
