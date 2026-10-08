package br.com.brain.permissao;

import java.util.Map;
import java.util.Set;

/**
 * Item que exige outro para funcionar (docs/permissoes.md, seção 6.4).
 *
 * Fica no código, e não no banco, porque cada dependência é consequência de
 * qual tela chama qual API — muda junto com o código da tela. O catálogo
 * devolve o mapa para a tela de grupos marcar junto, e o GrupoUsuarioService
 * recusa salvar um grupo que o quebre.
 */
public final class DependenciasPermissao {

    private static final Map<String, Set<String>> EXIGE = Map.of(
            // O formulário de edição carrega o aluno inteiro por GET /aluno/{id};
            // sem os dados pessoais, abriria com CPF, RG e endereço vazios.
            "ALUNO_CADASTRO", Set.of("ALUNO.DADOS_PESSOAIS.VER"),
            // Os botões Novo e Editar levam à tela de cadastro.
            "ALUNO.EDITAR", Set.of("ALUNO_CADASTRO"),
            // A aba de atendimento carrega os laudos da ficha (popup de vínculo).
            "ATENDIMENTO_PSICOLOGICO.VER", Set.of("FICHA_MEDICA.VER"),
            "FICHA_MEDICA.EDITAR", Set.of("FICHA_MEDICA.VER"),
            "SITUACAO_FAMILIAR.EDITAR", Set.of("SITUACAO_FAMILIAR.VER"),
            "ATENDIMENTO_PSICOLOGICO.REGISTRAR", Set.of("ATENDIMENTO_PSICOLOGICO.VER"));

    private DependenciasPermissao() {
    }

    public static Set<String> exigidos(String codigo) {
        return EXIGE.getOrDefault(codigo, Set.of());
    }

    public static Map<String, Set<String>> todas() {
        return EXIGE;
    }
}
