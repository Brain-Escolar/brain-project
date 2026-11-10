package br.com.brain.permissao.dto;

import br.com.brain.permissao.Modulo;

/**
 * Módulo do menu a que uma tela pertence (D33), com o pai quando é um
 * submódulo. A tela de grupos agrupa as telas por ele.
 */
public record ModuloDto(String codigo, String nome, int ordem, ModuloDto pai) {

    /** Nulo para tela sem módulo. Um nível desativado some e a tela sobe para o pai. */
    public static ModuloDto de(Modulo modulo) {
        if (modulo == null) {
            return null;
        }
        if (!Boolean.TRUE.equals(modulo.getAtivo())) {
            return de(modulo.getModuloPai());
        }
        return new ModuloDto(modulo.getCodigo(), modulo.getNome(), modulo.getOrdem(), de(modulo.getModuloPai()));
    }
}
