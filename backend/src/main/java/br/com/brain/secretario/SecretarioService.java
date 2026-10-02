package br.com.brain.secretario;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.endereco.EnderecoService;
import br.com.brain.secretario.dto.AtualizacaoSecretarioDto;
import br.com.brain.secretario.dto.CadastroSecretarioDto;
import br.com.brain.secretario.dto.ListagemSecretarioDto;
import br.com.brain.exception.ErrosSistema;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SecretarioService {

    private final SecretarioRepository repository;
    private final EnderecoService enderecoService;

    @Transactional
    public Secretario cadastrarSecretario(CadastroSecretarioDto dados) {

        var secretario = new Secretario();
        var dadosPessoais = new DadosPessoais();

        dadosPessoais.setCpf(dados.cpf());
        dadosPessoais.setNome(dados.nome());
        dadosPessoais.setNomeSocial(dados.nomeSocial());
        dadosPessoais.setEmail(dados.email());
        dadosPessoais.setEmailProfissional(dados.cpf() + "@escola.com");
        dadosPessoais.setDataDeNascimento(dados.dataDeNascimento());
        dadosPessoais.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
        dadosPessoais.setGenero(dados.genero());
        dadosPessoais.setCorRaca(dados.corRaca());
        dadosPessoais.setRg(dados.rg());
        dadosPessoais.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());
        dadosPessoais.setCidadeNaturalidade(dados.cidadeNaturalidade());
        dadosPessoais.setTelefones(dados.telefones());
        secretario.setDadosPessoais(dadosPessoais);

        repository.save(secretario);

        return secretario;
    }

    public Page<ListagemSecretarioDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemSecretarioDto::new);
    }

    @Transactional
    public Secretario atualizar(AtualizacaoSecretarioDto dados, Long id) {
        var secretario = detalhar(id);

        var dadosPessoais = secretario.getDadosPessoais();
        dadosPessoais.atualizarNome(dados.nome());
        dadosPessoais.atualizarDataDeNascimento(dados.dataDeNascimento());
        dadosPessoais.atualizarEmail(dados.email());
        if (dados.endereco() != null) {
            var endereco = enderecoService.atualizarEndereco(dadosPessoais.getEndereco(), dados.endereco());
            dadosPessoais.atualizarEndereco(endereco);
        }

        repository.save(secretario);

        return secretario;
    }

    @Transactional
    public void excluir(Long id) {
        var secretario = detalhar(id);
        repository.delete(secretario);
    }

    public Secretario detalhar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Secretario", id));
    }
}
