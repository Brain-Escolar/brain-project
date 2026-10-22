package br.com.brain.financeiro.dto;

import br.com.brain.contrato.Titulo;
import br.com.brain.enums.FaixaAging;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Uma linha da lista de cobranca.
 *
 * Carrega o nome do aluno E o do responsavel porque a secretaria liga para o
 * responsavel falando do aluno -- com so um dos dois a ligacao nao acontece.
 */
public record InadimplenciaLinhaDto(
        Long tituloId,
        Long contratoId,
        String contratoNumero,
        Long alunoId,
        String alunoNome,
        Long responsavelId,
        String responsavelNome,
        Integer numeroParcela,
        LocalDate competencia,
        LocalDate vencimento,
        long diasDeAtraso,
        BigDecimal valorLiquido,
        FaixaAging faixa) {

    public static InadimplenciaLinhaDto de(Titulo t, LocalDate referencia) {
        var contrato = t.getContrato();
        var aluno = contrato.getMatricula().getAluno();
        var dias = ChronoUnit.DAYS.between(t.getVencimento(), referencia);

        return new InadimplenciaLinhaDto(
                t.getId(),
                contrato.getId(),
                contrato.getNumero(),
                aluno.getId(),
                nomeDe(aluno.getDadosPessoais()),
                t.getResponsavel().getId(),
                nomeDe(t.getResponsavel().getDadosPessoais()),
                t.getNumeroParcela(),
                t.getCompetencia(),
                t.getVencimento(),
                dias,
                t.getValorLiquido(),
                FaixaAging.de(dias));
    }

    /**
     * DadosPessoais pode faltar: o cadastro minimo da V98 deixa criar aluno sem
     * ficha completa, e um relatorio que estoura NullPointerException por causa
     * disso e pior que um relatorio com um nome em branco.
     */
    private static String nomeDe(br.com.brain.dadosPessoais.DadosPessoais dp) {
        return dp == null ? null : dp.getNome();
    }
}
