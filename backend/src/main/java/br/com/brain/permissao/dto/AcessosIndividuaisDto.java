package br.com.brain.permissao.dto;

import br.com.brain.enums.PerfilNome;

import java.util.List;
import java.util.Map;

/**
 * Acessos individuais de uma pessoa num perfil, com o que ela já recebe dos
 * grupos para a tela mostrar junto.
 *
 * telas e controles são os individuais. herdados vai de cada código concedido
 * pelos grupos ativos da pessoa no perfil aos nomes desses grupos. grupos traz
 * também os inativos, para a tela explicar por que não somam.
 */
public record AcessosIndividuaisDto(
        Long dadosPessoaisId,
        String nome,
        String email,
        PerfilNome perfil,
        List<GrupoDaPessoaDto> grupos,
        Map<String, List<String>> herdados,
        List<String> telas,
        List<String> controles) {
}
