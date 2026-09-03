package br.com.brain.comunicado.dto;

import br.com.brain.enums.ComunicadoAbrangenciaEnum;
import br.com.brain.enums.ComunicadoPublicoEnum;
import jakarta.validation.constraints.NotNull;

/**
 * Uma regra de público-alvo informada no cadastro, ex.: RESPONSAVEIS + TURMA + turmaId 12.
 * turmaId é exigido em TURMA, serieId em SEGMENTO e ambos ficam nulos em GERAL.
 */
public record DestinatarioComunicadoDto(
        @NotNull ComunicadoPublicoEnum publico,
        @NotNull ComunicadoAbrangenciaEnum abrangencia,
        Long turmaId,
        Long serieId) {
}
