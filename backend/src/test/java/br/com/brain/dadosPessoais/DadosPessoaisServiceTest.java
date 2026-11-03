package br.com.brain.dadosPessoais;

import br.com.brain.endereco.Endereco;
import br.com.brain.exception.ErrosSistema;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Uma pessoa, um dados_pessoais: o professor que tambem e responsavel nao
 * pode virar duas pessoas, e duas pessoas nao podem virar uma.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DadosPessoaisService")
class DadosPessoaisServiceTest {

    @Mock
    private DadosPessoaisRepository repository;

    private DadosPessoaisService service;

    @BeforeEach
    void setUp() {
        service = new DadosPessoaisService(repository);
        lenient().when(repository.save(any(DadosPessoais.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(repository.findByCpf(any())).thenReturn(Optional.empty());
        lenient().when(repository.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());
    }

    private static DadosPessoais pessoa(Long id, String cpf, String nome, String email) {
        var dp = new DadosPessoais();
        dp.setId(id);
        dp.setCpf(cpf);
        dp.setNome(nome);
        dp.setEmail(email);
        return dp;
    }

    @Test
    @DisplayName("pessoa nova: salva o candidato")
    void pessoaNovaSalvaCandidato() {
        var candidato = pessoa(null, "11122233344", "Ana", "ana@email.com");

        assertThat(service.reaproveitarOuCriar(candidato)).isSameAs(candidato);
    }

    @Test
    @DisplayName("mesmo CPF: reaproveita e so completa o que estava vazio")
    void mesmoCpfReaproveitaSemSobrescrever() {
        var existente = pessoa(7L, "11122233344", "Ana Souza", "ana@email.com");
        existente.setDataDeNascimento(LocalDate.of(1980, 1, 1));
        when(repository.findByCpf("11122233344")).thenReturn(Optional.of(existente));
        when(repository.findByEmailIgnoreCase("ana@email.com")).thenReturn(Optional.of(existente));

        var candidato = pessoa(null, "11122233344", "Ana S.", "ana@email.com");
        candidato.setDataDeNascimento(LocalDate.of(1999, 9, 9));
        candidato.setRg("123456789");
        candidato.setEndereco(new Endereco("Rua A", "Centro", "01001000", null, "1", "SP", "São Paulo"));
        candidato.setTelefones(List.of("11999990000"));

        var resultado = service.reaproveitarOuCriar(candidato);

        assertThat(resultado).isSameAs(existente);
        assertThat(resultado.getNome()).isEqualTo("Ana Souza");
        assertThat(resultado.getDataDeNascimento()).isEqualTo(LocalDate.of(1980, 1, 1));
        assertThat(resultado.getRg()).isEqualTo("123456789");
        assertThat(resultado.getEndereco().getLogradouro()).isEqualTo("Rua A");
        assertThat(resultado.getTelefonesNumeros()).containsExactly("11999990000");
    }

    @Test
    @DisplayName("CPF de uma pessoa e e-mail de outra: recusa")
    void cpfEEmailDePessoasDiferentesRecusa() {
        when(repository.findByCpf("11122233344")).thenReturn(Optional.of(pessoa(1L, "11122233344", "Ana", "ana@x.com")));
        when(repository.findByEmailIgnoreCase("beto@x.com"))
                .thenReturn(Optional.of(pessoa(2L, "55566677788", "Beto", "beto@x.com")));

        assertThatThrownBy(() -> service.reaproveitarOuCriar(pessoa(null, "11122233344", "Ana", "beto@x.com")))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("e-mail de alguem com outro CPF: recusa")
    void emailComOutroCpfRecusa() {
        when(repository.findByEmailIgnoreCase("beto@x.com"))
                .thenReturn(Optional.of(pessoa(2L, "55566677788", "Beto", "beto@x.com")));

        assertThatThrownBy(() -> service.reaproveitarOuCriar(pessoa(null, "11122233344", "Beto", "beto@x.com")))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("lead sem CPF com o e-mail do pai: nao transforma o pai no aluno")
    void leadComEmailDoPaiRecusa() {
        when(repository.findByEmailIgnoreCase("pai@x.com"))
                .thenReturn(Optional.of(pessoa(2L, "55566677788", "Carlos Lima", "pai@x.com")));

        assertThatThrownBy(() -> service.reaproveitarOuCriar(pessoa(null, null, "Joãozinho Lima", "pai@x.com")))
                .isInstanceOf(ErrosSistema.OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("lead do CRM (sem CPF) recebe o CPF quando a mesma pessoa e cadastrada")
    void leadSemCpfGanhaCpf() {
        var lead = pessoa(3L, null, "José da Silva", "jose@x.com");
        when(repository.findByEmailIgnoreCase("jose@x.com")).thenReturn(Optional.of(lead));

        var resultado = service.reaproveitarOuCriar(pessoa(null, "11122233344", "Jose  da  Silva", "jose@x.com"));

        assertThat(resultado).isSameAs(lead);
        assertThat(resultado.getCpf()).isEqualTo("11122233344");
    }
}
