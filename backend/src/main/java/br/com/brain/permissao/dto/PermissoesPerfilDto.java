package br.com.brain.permissao.dto;

import java.util.List;

public record PermissoesPerfilDto(List<String> telas, List<String> controles) {
}
