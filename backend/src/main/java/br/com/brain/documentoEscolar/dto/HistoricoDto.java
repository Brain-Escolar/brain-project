package br.com.brain.documentoEscolar.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Histórico escolar: um bloco por ano letivo cursado na escola e as notas
 * finais de cada componente curricular, casados pelo nome da disciplina.
 */
public record HistoricoDto(
        EscolaDocumentoDto escola,
        AlunoDocumentoDto aluno,
        BigDecimal notaAprovacao,
        Integer frequenciaMinima,
        Integer casasDecimais,
        List<AnoHistoricoDto> anos,
        List<ComponenteHistoricoDto> componentes,
        String emitidoPor,
        LocalDateTime emitidoEm) {
}
