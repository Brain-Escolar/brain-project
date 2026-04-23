package br.com.brain.responsavel.services;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.responsavel.domain.Responsavel;
import br.com.brain.responsavel.domain.ResponsavelRepository;
import br.com.brain.responsavel.dtos.AtualizacaoResponsavelDto;
import br.com.brain.responsavel.dtos.CadastroResponsavelDto;
import br.com.brain.responsavel.dtos.ListagemResponsavelDto;
import br.com.brain.shared.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ResponsavelService {

    private final ResponsavelRepository repository;
    private final EnderecoService enderecoService;
    private final DadosPessoaisService dadosPessoaisService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Responsavel cadastrarResponsavel(CadastroResponsavelDto dados, Long alunoId) {

        var responsavel = new Responsavel();
        var dadosPessoais = dadosPessoaisService
                .buscarDadosPessoaisPorCpf(dados.cpf())
                .orElseGet(() -> criarDadosPessoais(dados));

        responsavel.setDadosPessoais(dadosPessoais);
        responsavel.setFinanceiro(dados.financeiro());

        var responsavelCadastrado = repository.save(responsavel);

        vincularAlunos(responsavelCadastrado.getId(), List.of(alunoId));

        return responsavel;
    }

    @Transactional
    public Optional<Responsavel> buscarResponsavelPorCpf(String cpf) {
        return repository.findByDadosPessoaisCpf(cpf);
    }

    public Page<ListagemResponsavelDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemResponsavelDto::new);
    }

    @Transactional
    public Responsavel atualizar(AtualizacaoResponsavelDto dados, Long id) {
        var responsavel = repository.findById(id).orElseThrow(
                () -> ErrosSistema.RecursoNaoEncontradoException.para("Responsável", id));

        if (dados.nome() != null) {
            responsavel.getDadosPessoais().setNome(dados.nome());
        }
        if (dados.email() != null) {
            responsavel.getDadosPessoais().setEmail(dados.email());
        }
        if (dados.endereco() != null) {
            var endereco = enderecoService.atualizarEndereco(responsavel.getDadosPessoais().getEndereco(),
                    dados.endereco());
            responsavel.getDadosPessoais().setEndereco(endereco);
        }
        if (dados.dataDeNascimento() != null) {
            responsavel.getDadosPessoais().setDataDeNascimento(dados.dataDeNascimento());
        }
        if (dados.financeiro() != null) {
            responsavel.setFinanceiro(dados.financeiro());
        }
        if (dados.telefones() != null) {
            responsavel.getDadosPessoais().setTelefones(dados.telefones());
        }

        repository.save(responsavel);

        return responsavel;
    }

    @Transactional
    public void excluir(Long id) {
        var responsavel = repository.findById(id).orElseThrow(
                () -> ErrosSistema.RecursoNaoEncontradoException.para("Responsável", id));
        repository.delete(responsavel);
    }

    public Responsavel detalhar(Long id) {
        return repository.findById(id).orElseThrow(
                () -> ErrosSistema.RecursoNaoEncontradoException.para("Responsável", id));
    }

    @Transactional
    public Responsavel vincularAlunos(Long responsavelId, List<Long> alunoIds) {
        var responsavel = repository.findById(responsavelId).orElseThrow(
                () -> ErrosSistema.RecursoNaoEncontradoException.para("Responsável", responsavelId));
        var alunos = responsavel.getAlunos();
        for (Long alunoId : alunoIds) {
            var aluno = em.getReference(Aluno.class, alunoId);
            alunos.add(aluno);
        }
        responsavel.setAlunos(alunos);
        repository.save(responsavel);
        return responsavel;
    }

    private DadosPessoais criarDadosPessoais(CadastroResponsavelDto dados) {
        var dadosPessoais = new DadosPessoais();

        dadosPessoais.setCpf(dados.cpf());
        dadosPessoais.setNome(dados.nome());
        dadosPessoais.setEmail(dados.email());
        dadosPessoais.setDataDeNascimento(dados.dataDeNascimento());
        dadosPessoais.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
        dadosPessoais.setTelefones(dados.telefones());

        return dadosPessoaisService.salvar(dadosPessoais);
    }
}
