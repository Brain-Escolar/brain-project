package br.com.brain.documento.dto;

import java.util.List;

/**
 * Checklist de documentacao da matricula: o aluno e seus responsaveis.
 * "completa" = todo documento obrigatorio de todas as pessoas APROVADO e no prazo.
 */
public record DocumentacaoAlunoDto(
        Long alunoId,
        boolean completa,
        List<DocumentacaoPessoaDto> pessoas) {
}
