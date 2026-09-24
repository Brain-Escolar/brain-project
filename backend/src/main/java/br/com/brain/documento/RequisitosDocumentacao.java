package br.com.brain.documento;

import br.com.brain.enums.TipoDocumento;

import java.util.Collection;
import java.util.List;

import static br.com.brain.enums.TipoDocumento.CARTEIRA_VACINACAO;
import static br.com.brain.enums.TipoDocumento.CERTIDAO_NASCIMENTO;
import static br.com.brain.enums.TipoDocumento.COMPROVANTE_RESIDENCIA;
import static br.com.brain.enums.TipoDocumento.CPF;
import static br.com.brain.enums.TipoDocumento.DECLARACAO_TRANSFERENCIA;
import static br.com.brain.enums.TipoDocumento.DOCUMENTO_IDENTIDADE;
import static br.com.brain.enums.TipoDocumento.HISTORICO_ESCOLAR;

/**
 * Quais documentos cada pessoa precisa entregar na matricula.
 *
 * Fixo em codigo enquanto o sistema atende uma escola. Quando cada escola
 * precisar da propria lista, isto vira tabela por unidade - o TipoDocumento
 * gravado em documentos nao muda.
 */
public final class RequisitosDocumentacao {

    private RequisitosDocumentacao() {
    }

    public record Requisito(TipoDocumento tipo, boolean obrigatorio) {
    }

    private static final List<Requisito> ALUNO = List.of(
            new Requisito(CERTIDAO_NASCIMENTO, true),
            new Requisito(CPF, true),
            new Requisito(CARTEIRA_VACINACAO, true),
            new Requisito(DOCUMENTO_IDENTIDADE, false),
            new Requisito(HISTORICO_ESCOLAR, false),
            new Requisito(DECLARACAO_TRANSFERENCIA, false));

    private static final List<Requisito> RESPONSAVEL_FINANCEIRO = List.of(
            new Requisito(DOCUMENTO_IDENTIDADE, true),
            new Requisito(CPF, true),
            new Requisito(COMPROVANTE_RESIDENCIA, true));

    private static final List<Requisito> RESPONSAVEL = List.of(
            new Requisito(DOCUMENTO_IDENTIDADE, false),
            new Requisito(CPF, false));

    public static List<Requisito> doAluno() {
        return ALUNO;
    }

    public static List<Requisito> doResponsavel(boolean financeiro) {
        return financeiro ? RESPONSAVEL_FINANCEIRO : RESPONSAVEL;
    }

    /**
     * Todo requisito obrigatorio tem um documento valido (aprovado e no prazo).
     * Regra unica usada pelo checklist e por Aluno.isCadastroCompleto.
     */
    public static boolean atendidos(List<Requisito> requisitos, Collection<Documento> documentos) {
        var entregues = documentos == null ? List.<Documento>of() : documentos;
        return requisitos.stream()
                .filter(Requisito::obrigatorio)
                .allMatch(r -> entregues.stream().anyMatch(d -> d.getTipo() == r.tipo() && d.isValido()));
    }
}
