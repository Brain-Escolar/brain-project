package br.com.brain.crm.dto;

import br.com.brain.enums.TipoProcessoMatricula;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

/**
 * Dados para abrir um processo no CRM. Ou {@code alunoId} aponta para um aluno
 * já existente (rematrícula de quem já foi ou é aluno da escola), ou
 * {@code nomeAluno}/{@code email} vêm preenchidos para cadastrar um aluno novo
 * — o service valida essa regra (não dá para exigir os dois via bean validation
 * porque são mutuamente supletivos, não sempre obrigatórios).
 */
public record CadastroLeadCrmDto(
        Long alunoId,
        String nomeAluno,
        @Email String email,
        Long serieId,
        @NotNull Integer anoLetivo,
        @NotNull TipoProcessoMatricula tipo,
        @NotNull Long origemId,
        String responsavelNome,
        String responsavelTelefone,
        Long funcionarioId) {
}
