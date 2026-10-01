package br.com.brain.documentoEscolar.dto;

import java.time.LocalDate;

/**
 * Identificação do aluno nos documentos escolares. Série, turma e unidade são
 * as atuais; o boletim de um ano anterior traz as daquele ano no relatório.
 */
public record AlunoDocumentoDto(
        Long id,
        String nome,
        String matricula,
        LocalDate dataNascimento,
        String cpf,
        String naturalidade,
        String serie,
        String turma,
        String unidade,
        boolean matriculado,
        LocalDate dataDesmatricula,
        String motivoDesmatricula) {
}
