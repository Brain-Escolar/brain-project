package br.com.brain.conversa;

import br.com.brain.enums.PerfilNome;

import java.util.Map;
import java.util.Set;

public final class ConversaPermissoes {

    public static final Map<PerfilNome, Set<PerfilNome>> DESTINATARIOS_PERMITIDOS = Map.of(
            PerfilNome.PROFESSOR, Set.of(
                    PerfilNome.ORIENTADOR,
                    PerfilNome.DIRETOR,
                    PerfilNome.COORDENADOR,
                    PerfilNome.RECURSOS_HUMANOS,
                    PerfilNome.SECRETARIO
            ),
            PerfilNome.ESTUDANTE, Set.of(
                    PerfilNome.SECRETARIO,
                    PerfilNome.COORDENADOR,
                    PerfilNome.ORIENTADOR
            )
    );

    private ConversaPermissoes() {}
}
