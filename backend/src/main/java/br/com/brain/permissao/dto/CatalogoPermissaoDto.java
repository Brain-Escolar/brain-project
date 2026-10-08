package br.com.brain.permissao.dto;

import br.com.brain.enums.PerfilNome;

import java.util.List;
import java.util.Map;

/**
 * O que um grupo do perfil pode receber: as telas do teto, cada uma com seus
 * controles; os controles sem tela; e as dependências entre itens, para a tela
 * de grupos marcar junto o que é exigido.
 */
public record CatalogoPermissaoDto(
        PerfilNome perfil,
        List<TelaCatalogoDto> telas,
        List<ControleCatalogoDto> controlesGerais,
        Map<String, List<String>> dependencias) {
}
