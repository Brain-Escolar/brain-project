package br.com.brain.matricula.dto;

public record RematriculaDto(
        int anoOrigem,
        int anoDestino,
        /** Pré-matrículas criadas no ano de destino. */
        int criadas,
        /** Já tinham matrícula viva no destino (CRM chegou antes). */
        int jaMatriculados,
        /** Aprovados na série final. */
        int concluintes,
        /** Ano encerrado sem resultado (faltou nota): ficam para a secretaria decidir. */
        int semResultado,
        /** Aprovados numa série sem destino informado. */
        int semDestino) {
}
