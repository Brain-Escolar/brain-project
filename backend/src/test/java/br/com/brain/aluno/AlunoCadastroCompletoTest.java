package br.com.brain.aluno;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.documento.Documento;
import br.com.brain.documento.RequisitosDocumentacao;
import br.com.brain.endereco.Endereco;
import br.com.brain.enums.StatusDocumento;
import br.com.brain.enums.TipoDocumento;
import br.com.brain.responsavel.Responsavel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * isCadastroCompleto alimenta o badge da lista de alunos e o aviso do funil do
 * CRM: dados pessoais, responsavel financeiro e documentos obrigatorios.
 */
@DisplayName("Aluno.isCadastroCompleto")
class AlunoCadastroCompletoTest {

    private Aluno aluno;
    private Responsavel financeiro;
    private Responsavel naoFinanceiro;

    @BeforeEach
    void setUp() {
        financeiro = responsavel(true);
        naoFinanceiro = responsavel(false);

        aluno = new Aluno();
        aluno.setDadosPessoais(pessoaComDados("11122233344"));
        aluno.getDadosPessoais().setDataDeNascimento(LocalDate.of(2015, 3, 10));
        aluno.setResponsaveis(new ArrayList<>(List.of(financeiro, naoFinanceiro)));
    }

    @Test
    @DisplayName("dados e documentos obrigatorios aprovados: completo")
    void completo() {
        entregarObrigatorios();

        assertThat(aluno.isCadastroCompleto()).isTrue();
    }

    @Test
    @DisplayName("dados completos mas sem documentos: incompleto")
    void semDocumentos() {
        assertThat(aluno.isCadastroCompleto()).isFalse();
    }

    @Test
    @DisplayName("documento do aluno em analise ainda nao conta")
    void documentoEmAnalise() {
        entregarObrigatorios();
        documentoDe(aluno.getDadosPessoais(), TipoDocumento.CPF).setStatus(StatusDocumento.EM_ANALISE);

        assertThat(aluno.isCadastroCompleto()).isFalse();
    }

    @Test
    @DisplayName("comprovante do responsavel financeiro vencido: incompleto")
    void comprovanteVencido() {
        entregarObrigatorios();
        documentoDe(financeiro.getDadosPessoais(), TipoDocumento.COMPROVANTE_RESIDENCIA)
                .setDataValidade(LocalDate.now().minusDays(1));

        assertThat(aluno.isCadastroCompleto()).isFalse();
    }

    @Test
    @DisplayName("responsavel nao financeiro nao precisa entregar documentos")
    void naoFinanceiroSemDocumentos() {
        entregarObrigatorios();

        assertThat(naoFinanceiro.getDadosPessoais().getDocumentos()).isEmpty();
        assertThat(aluno.isCadastroCompleto()).isTrue();
    }

    @Test
    @DisplayName("documentos em dia nao suprem dados pessoais faltando")
    void documentosSemDados() {
        entregarObrigatorios();
        aluno.getDadosPessoais().setCpf(null);

        assertThat(aluno.isCadastroCompleto()).isFalse();
    }

    // --------------------------------------------------------------- helpers

    private void entregarObrigatorios() {
        entregar(aluno.getDadosPessoais(), RequisitosDocumentacao.doAluno());
        entregar(financeiro.getDadosPessoais(), RequisitosDocumentacao.doResponsavel(true));
    }

    private static void entregar(DadosPessoais pessoa, List<RequisitosDocumentacao.Requisito> requisitos) {
        requisitos.stream()
                .filter(RequisitosDocumentacao.Requisito::obrigatorio)
                .forEach(r -> {
                    var documento = new Documento();
                    documento.setDadosPessoais(pessoa);
                    documento.setTipo(r.tipo());
                    documento.setStatus(StatusDocumento.APROVADO);
                    pessoa.getDocumentos().add(documento);
                });
    }

    private static Documento documentoDe(DadosPessoais pessoa, TipoDocumento tipo) {
        return pessoa.getDocumentos().stream().filter(d -> d.getTipo() == tipo).findFirst().orElseThrow();
    }

    private static Responsavel responsavel(boolean financeiro) {
        var responsavel = new Responsavel();
        responsavel.setFinanceiro(financeiro);
        responsavel.setDadosPessoais(pessoaComDados(financeiro ? "55566677788" : "99988877766"));
        return responsavel;
    }

    private static DadosPessoais pessoaComDados(String cpf) {
        var pessoa = new DadosPessoais();
        pessoa.setNome("Pessoa " + cpf);
        pessoa.setCpf(cpf);
        pessoa.setEndereco(new Endereco("Rua A", "Centro", "01001000", null, "100", "SP", "São Paulo"));
        pessoa.setTelefones(List.of("11999990000"));
        return pessoa;
    }
}
