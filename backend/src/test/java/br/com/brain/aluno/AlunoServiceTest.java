package br.com.brain.aluno;

import br.com.brain.aluno.dto.AtualizacaoAlunoDto;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisRepository;
import br.com.brain.endereco.Endereco;
import br.com.brain.endereco.EnderecoService;
import br.com.brain.endereco.dto.EnderecoDto;
import br.com.brain.responsavel.Responsavel;
import br.com.brain.responsavel.ResponsavelService;
import br.com.brain.responsavel.dto.CadastroResponsavelDto;
import br.com.brain.usuario.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Aluno vindo do CRM nasce so com nome+email — sem isso o primeiro save feito
 * pela tela de "completar cadastro" quebrava com NPE (endereco nulo) e
 * descartava CPF/RG/telefone/responsavel em silencio. Os testes aqui cobrem
 * essa transicao de "cadastro minimo" para "cadastro completo".
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AlunoService")
class AlunoServiceTest {

    @Mock
    private AlunoRepository repository;
    @Mock
    private DadosPessoaisRepository dadosPessoaisRepository;
    @Mock
    private EnderecoService enderecoService;
    @Mock
    private UsuarioService usuarioService;
    @Mock
    private ResponsavelService responsavelService;

    private AlunoService service;

    @BeforeEach
    void setUp() {
        service = new AlunoService(repository, dadosPessoaisRepository, enderecoService, usuarioService,
                responsavelService);
        lenient().when(repository.save(any(Aluno.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("atualizar: aluno vindo do CRM sem endereco, preenche cpf/rg/telefone/endereco/responsavel sem quebrar")
    void atualizarAlunoMinimoCompletaCadastro() {
        var dadosPessoais = new DadosPessoais();
        dadosPessoais.setNome("Fulano");
        dadosPessoais.setEmail("fulano@escola.com");
        var aluno = new Aluno();
        aluno.setId(1L);
        aluno.setDadosPessoais(dadosPessoais);

        when(repository.findById(1L)).thenReturn(Optional.of(aluno));

        var enderecoDto = new EnderecoDto("Rua A", "Centro", "01001000", "São Paulo", "SP", null, "100");
        var enderecoPreenchido = new Endereco("Rua A", "Centro", "01001000", null, "100", "SP", "São Paulo");
        when(enderecoService.atualizarEndereco(isNull(), eq(enderecoDto))).thenReturn(enderecoPreenchido);

        var responsavelDto = new CadastroResponsavelDto("11122233344", "Mãe do Fulano", "mae@email.com",
                LocalDate.of(1980, 1, 1), enderecoDto, true, List.of("11999990000"));
        var responsavelCadastrado = new Responsavel();
        responsavelCadastrado.setId(9L);
        when(responsavelService.cadastrarResponsavel(responsavelDto, 1L)).thenReturn(responsavelCadastrado);

        var dados = new AtualizacaoAlunoDto("Fulano da Silva", LocalDate.of(2010, 5, 20), "fulano@escola.com",
                "12345678900", "12.345.678-9", enderecoDto, List.of("11988887777"), List.of(responsavelDto));

        var resultado = service.atualizar(1L, dados);

        assertThat(resultado.getDadosPessoais().getCpf()).isEqualTo("12345678900");
        assertThat(resultado.getDadosPessoais().getRg()).isEqualTo("12.345.678-9");
        assertThat(resultado.getDadosPessoais().getEndereco()).isSameAs(enderecoPreenchido);
        assertThat(resultado.getResponsaveis()).containsExactly(responsavelCadastrado);
    }

    @Test
    @DisplayName("atualizar: sem responsaveis no payload, nao chama o cadastro de responsavel")
    void atualizarSemResponsaveisNaoCriaResponsavel() {
        var dadosPessoais = new DadosPessoais();
        dadosPessoais.setNome("Fulano");
        var aluno = new Aluno();
        aluno.setId(1L);
        aluno.setDadosPessoais(dadosPessoais);

        when(repository.findById(1L)).thenReturn(Optional.of(aluno));

        var dados = new AtualizacaoAlunoDto("Fulano", null, null, null, null, null, null, null);

        var resultado = service.atualizar(1L, dados);

        assertThat(resultado.getResponsaveis()).isEmpty();
    }
}
