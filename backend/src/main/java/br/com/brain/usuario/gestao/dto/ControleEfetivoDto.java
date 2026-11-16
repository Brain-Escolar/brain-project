package br.com.brain.usuario.gestao.dto;

import java.util.List;

/** Ação liberada no perfil. sensivel marca dado da família ou do aluno (D23). */
public record ControleEfetivoDto(String codigo, String nome, String tela, boolean sensivel,
        List<OrigemAcessoDto> origens) {
}
