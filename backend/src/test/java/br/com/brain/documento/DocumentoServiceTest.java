package br.com.brain.documento;

import br.com.brain.aluno.Aluno;
import br.com.brain.aluno.AlunoRepository;
import br.com.brain.arquivo.Arquivo;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.documento.dto.DocumentacaoPessoaDto;
import br.com.brain.documento.dto.ItemChecklistDocumentoDto;
import br.com.brain.enums.SituacaoDocumento;
import br.com.brain.enums.StatusDocumento;
import br.com.brain.enums.TipoDocumento;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.infra.aws.S3Service;
import br.com.brain.responsavel.Responsavel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DocumentoService")
class DocumentoServiceTest {

    @Mock
    private DocumentoRepository repository;
    @Mock
    private AlunoRepository alunoRepository;
    @Mock
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Mock
    private ArmazenamentoDocumentoService armazenamento;
    @Mock
    private S3Service s3Service;

    @InjectMocks
    private DocumentoService service;

    private DadosPessoais pessoaAluno;
    private DadosPessoais pessoaPai;
    private DadosPessoais pessoaMae;
    private Aluno aluno;
    private Responsavel pai;
    private Responsavel mae;

    @BeforeEach
    void setUp() {
        pessoaAluno = pessoa(1L, "Aluno");
        pessoaPai = pessoa(2L, "Pai");
        pessoaMae = pessoa(3L, "Mae");

        pai = new Responsavel();
        pai.setDadosPessoais(pessoaPai);
        pai.setFinanceiro(true);
        mae = new Responsavel();
        mae.setDadosPessoais(pessoaMae);
        mae.setFinanceiro(false);

        aluno = new Aluno();
        aluno.setId(10L);
        aluno.setDadosPessoais(pessoaAluno);
        aluno.setResponsaveis(new ArrayList<>(List.of(pai, mae)));

        lenient().when(alunoRepository.findById(10L)).thenReturn(Optional.of(aluno));
        lenient().when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(armazenamento.salvarDocumento(any())).thenAnswer(inv -> new Arquivo());
    }

    // ------------------------------------------------------------- checklist

    @Test
    @DisplayName("sem documentos: obrigatorios pendentes e documentacao incompleta")
    void semDocumentos() {
        when(repository.findByDadosPessoaisIdIn(anyCollection())).thenReturn(List.of());

        var documentacao = service.documentacaoDoAluno(10L);

        assertThat(documentacao.completa()).isFalse();
        var itensAluno = documentacao.pessoas().get(0).itens();
        assertThat(itensAluno).filteredOn(ItemChecklistDocumentoDto::obrigatorio)
                .extracting(ItemChecklistDocumentoDto::situacao)
                .containsOnly(SituacaoDocumento.PENDENTE);
    }

    @Test
    @DisplayName("completa quando todo obrigatorio do aluno e do financeiro esta aprovado")
    void completaComObrigatoriosAprovados() {
        var documentos = new ArrayList<Documento>();
        RequisitosDocumentacao.doAluno().stream().filter(RequisitosDocumentacao.Requisito::obrigatorio)
                .forEach(r -> documentos.add(aprovado(pessoaAluno, r.tipo(), null)));
        RequisitosDocumentacao.doResponsavel(true).stream().filter(RequisitosDocumentacao.Requisito::obrigatorio)
                .forEach(r -> documentos.add(aprovado(pessoaPai, r.tipo(), null)));
        when(repository.findByDadosPessoaisIdIn(anyCollection())).thenReturn(documentos);

        var documentacao = service.documentacaoDoAluno(10L);

        // A mae nao e financeira: nada obrigatorio para ela.
        assertThat(documentacao.completa()).isTrue();
    }

    @Test
    @DisplayName("documento aprovado mas vencido nao conta como entregue")
    void vencidoNaoConta() {
        var comprovante = aprovado(pessoaPai, TipoDocumento.COMPROVANTE_RESIDENCIA, LocalDate.now().minusDays(1));
        when(repository.findByDadosPessoaisIdIn(anyCollection())).thenReturn(List.of(comprovante));

        var documentacao = service.documentacaoDoAluno(10L);

        var itemPai = documentacao.pessoas().stream()
                .filter(p -> p.dadosPessoaisId().equals(2L))
                .flatMap(p -> p.itens().stream())
                .filter(i -> i.tipo() == TipoDocumento.COMPROVANTE_RESIDENCIA)
                .findFirst().orElseThrow();
        assertThat(itemPai.situacao()).isEqualTo(SituacaoDocumento.VENCIDO);
    }

    @Test
    @DisplayName("portal: responsavel ve o aluno e a si mesmo, nunca o outro responsavel")
    void portalNaoExpoeOutroResponsavel() {
        when(repository.findByDadosPessoaisIdIn(anyCollection())).thenReturn(List.of());

        var documentacao = service.documentacaoParaResponsavel(aluno, mae);

        assertThat(documentacao.pessoas()).extracting(DocumentacaoPessoaDto::dadosPessoaisId)
                .containsExactly(1L, 3L);
    }

    // ----------------------------------------------------------------- envio

    @Test
    @DisplayName("reenvio apos rejeicao volta para analise e limpa o motivo")
    void reenvioAposRejeicao() {
        var rejeitado = documento(pessoaAluno, TipoDocumento.CPF, StatusDocumento.REJEITADO);
        rejeitado.setMotivoRejeicao("Ilegivel");
        when(repository.findByDadosPessoaisIdAndTipo(1L, TipoDocumento.CPF)).thenReturn(Optional.of(rejeitado));

        var resultado = service.enviarPeloPortal(pessoaAluno, TipoDocumento.CPF, arquivos(1));

        assertThat(resultado.status()).isEqualTo(StatusDocumento.EM_ANALISE);
        assertThat(resultado.motivoRejeicao()).isNull();
    }

    @Test
    @DisplayName("portal nao substitui documento aprovado e em dia")
    void portalNaoSubstituiAprovado() {
        var aprovado = aprovado(pessoaAluno, TipoDocumento.CPF, null);
        when(repository.findByDadosPessoaisIdAndTipo(1L, TipoDocumento.CPF)).thenReturn(Optional.of(aprovado));

        assertThatThrownBy(() -> service.enviarPeloPortal(pessoaAluno, TipoDocumento.CPF, arquivos(1)))
                .isInstanceOf(OperacaoInvalidaException.class);
        verify(armazenamento, never()).salvarDocumento(any());
    }

    @Test
    @DisplayName("secretaria pode substituir documento aprovado")
    void secretariaSubstituiAprovado() {
        var aprovado = aprovado(pessoaAluno, TipoDocumento.CPF, null);
        when(dadosPessoaisRepository.findById(1L)).thenReturn(Optional.of(pessoaAluno));
        when(repository.findByDadosPessoaisIdAndTipo(1L, TipoDocumento.CPF)).thenReturn(Optional.of(aprovado));

        var resultado = service.enviar(1L, TipoDocumento.CPF, arquivos(1));

        assertThat(resultado.status()).isEqualTo(StatusDocumento.EM_ANALISE);
    }

    @Test
    @DisplayName("limita a quantidade de arquivos por documento")
    void limiteDeArquivos() {
        assertThatThrownBy(() -> service.enviarPeloPortal(pessoaAluno, TipoDocumento.CPF,
                arquivos(DocumentoService.MAX_ARQUIVOS_POR_DOCUMENTO + 1)))
                .isInstanceOf(OperacaoInvalidaException.class);
    }

    // ------------------------------------------------------------- validacao

    @Test
    @DisplayName("so valida documento em analise")
    void soValidaEmAnalise() {
        var aprovado = aprovado(pessoaAluno, TipoDocumento.CPF, null);
        aprovado.setId(50L);
        when(repository.findById(50L)).thenReturn(Optional.of(aprovado));

        assertThatThrownBy(() -> service.rejeitar(50L, 99L, "motivo"))
                .isInstanceOf(OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("aprovacao registra validador e validade")
    void aprovacao() {
        var emAnalise = documento(pessoaPai, TipoDocumento.COMPROVANTE_RESIDENCIA, StatusDocumento.EM_ANALISE);
        emAnalise.setId(51L);
        var validador = pessoa(99L, "Secretaria");
        when(repository.findById(51L)).thenReturn(Optional.of(emAnalise));
        when(dadosPessoaisRepository.getReferenceById(99L)).thenReturn(validador);
        var validade = LocalDate.now().plusMonths(3);

        var resultado = service.aprovar(51L, 99L, validade);

        assertThat(resultado.status()).isEqualTo(StatusDocumento.APROVADO);
        assertThat(resultado.dataValidade()).isEqualTo(validade);
        assertThat(resultado.validadoPor()).isEqualTo("Secretaria");
        assertThat(resultado.validadoEm()).isNotNull();
    }

    // --------------------------------------------------------------- helpers

    private static DadosPessoais pessoa(Long id, String nome) {
        var dp = new DadosPessoais();
        dp.setId(id);
        dp.setNome(nome);
        return dp;
    }

    private static Documento documento(DadosPessoais pessoa, TipoDocumento tipo, StatusDocumento status) {
        var documento = new Documento();
        documento.setId(pessoa.getId() * 100 + tipo.ordinal());
        documento.setDadosPessoais(pessoa);
        documento.setTipo(tipo);
        documento.setStatus(status);
        return documento;
    }

    private static Documento aprovado(DadosPessoais pessoa, TipoDocumento tipo, LocalDate validade) {
        var documento = documento(pessoa, tipo, StatusDocumento.APROVADO);
        documento.setDataValidade(validade);
        return documento;
    }

    private static List<MultipartFile> arquivos(int quantidade) {
        return Collections.nCopies(quantidade,
                new MockMultipartFile("arquivos", "doc.pdf", "application/pdf", "%PDF".getBytes()));
    }
}
