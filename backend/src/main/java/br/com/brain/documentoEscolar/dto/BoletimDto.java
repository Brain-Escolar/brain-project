package br.com.brain.documentoEscolar.dto;

import br.com.brain.relatorios.dto.RelatorioDto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Boletim escolar de um ano letivo. {@code relatorio} é nulo quando o aluno não
 * tem turma no ano pedido (ex.: matriculado mas ainda não enturmado).
 * {@code ultimoPeriodoIniciado} limita até onde o boletim pode ser recortado.
 */
public record BoletimDto(
        EscolaDocumentoDto escola,
        AlunoDocumentoDto aluno,
        List<Integer> anosDisponiveis,
        Integer anoLetivo,
        Integer periodoAte,
        Integer ultimoPeriodoIniciado,
        String turno,
        RelatorioDto relatorio,
        String emitidoPor,
        LocalDateTime emitidoEm) {
}
