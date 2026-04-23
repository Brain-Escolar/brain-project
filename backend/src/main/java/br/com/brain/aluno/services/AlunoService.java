package br.com.brain.aluno.services;

import br.com.brain.aluno.domain.Aluno;
import br.com.brain.aluno.domain.AlunoRepository;
import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.dadosPessoais.domain.DadosPessoaisRepository;
import br.com.brain.serie.domain.Serie;
import br.com.brain.turma.domain.Turma;
import br.com.brain.unidade.domain.Unidade;
import br.com.brain.aluno.dtos.AtualizacaoAlunoDto;
import br.com.brain.aluno.dtos.CadastroAlunoDto;
import br.com.brain.aluno.dtos.ListagemAlunoDto;
import br.com.brain.aula.dtos.ListagemAulaDto;
import br.com.brain.responsavel.dtos.CadastroResponsavelDto;
import br.com.brain.serie.dtos.SerieUnidadeTurmaDto;
import br.com.brain.shared.enums.PerfilNome;
import br.com.brain.shared.exception.ErrosSistema;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AlunoService {

    private final AlunoRepository repository;
    private final DadosPessoaisRepository dadosPessoaisRepository;
    private final EnderecoService enderecoService;
    private final UsuarioService usuarioService;
    private final ResponsavelService responsavelService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Aluno cadastrarAluno(CadastroAlunoDto dados) {

        var aluno = new Aluno();
        var dadosPessoais = new DadosPessoais();

        dadosPessoais.setCpf(dados.cpf());
        dadosPessoais.setRg(dados.rg());
        dadosPessoais.setNome(dados.nome());
        dadosPessoais.setNomeSocial(dados.nomeSocial());
        dadosPessoais.setEmail(dados.email());
        dadosPessoais.setDataDeNascimento(dados.dataDeNascimento());
        dadosPessoais.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
        dadosPessoais.setGenero(dados.genero());
        dadosPessoais.setCorRaca(dados.corRaca());
        dadosPessoais.setCidadeNaturalidade(dados.cidadeNaturalidade());
        dadosPessoais.setTelefones(dados.telefones());
        dadosPessoaisRepository.save(dadosPessoais);
        aluno.setDadosPessoais(dadosPessoais);

        var alunoCadastrado = repository.save(aluno);

        if (dados.responsaveis() != null && !dados.responsaveis().isEmpty()) {
            for (CadastroResponsavelDto responsavel : dados.responsaveis()) {
                var responsavelCadastrado = responsavelService.cadastrarResponsavel(responsavel,
                        alunoCadastrado.getId());
                alunoCadastrado.getResponsaveis().add(responsavelCadastrado);
            }
            repository.save(alunoCadastrado);
        }

        return alunoCadastrado;
    }

    public Page<ListagemAlunoDto> listarAlunos(Pageable paginacao) {
        return repository.findByMatriculadoTrue(paginacao).map(ListagemAlunoDto::new);
    }

    public Page<ListagemAlunoDto> listarLeads(Pageable paginacao) {
        return repository.findByMatriculadoFalse(paginacao).map(ListagemAlunoDto::new);
    }

    @Transactional
    public Aluno atualizar(Long id, AtualizacaoAlunoDto dados) {
        var aluno = repository.findById(id).orElseThrow(
                () -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", id));

        var dadosPessoais = aluno.getDadosPessoais();
        dadosPessoais.atualizarNome(dados.nome());
        dadosPessoais.atualizarDataDeNascimento(dados.dataDeNascimento());
        dadosPessoais.atualizarEmail(dados.email());

        var endereco = enderecoService.atualizarEndereco(dadosPessoais.getEndereco(), dados.endereco());
        dadosPessoais.atualizarEndereco(endereco);

        repository.save(aluno);

        return aluno;
    }

    @Transactional
    public void excluir(Long id) {
        var aluno = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", id));
        repository.delete(aluno);
    }

    public Aluno detalhar(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", id));
    }

    public List<ListagemAulaDto> gerarGradeHoraria(String matricula) {
        return repository.gerarGradeHoraria(matricula).stream().map(ListagemAulaDto::new).toList();
    }

    @Transactional
    public Aluno matricular(Long id) {
        var aluno = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", id));
        var dadosPessoais = aluno.getDadosPessoais();
        dadosPessoais.setMatricula("M" + aluno.getId());
        dadosPessoais.setEmailProfissional(dadosPessoais.getMatricula() + "@escola.com");
        aluno.setMatriculado(true);
        usuarioService.cadastrarUsuario(dadosPessoais,
                PerfilNome.ESTUDANTE,
                dadosPessoais.getCpf());
        repository.save(aluno);
        return aluno;
    }

    @Transactional
    public Aluno desmatricular(Long id) {
        var aluno = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", id));
        usuarioService.desativarUsuario(aluno.getDadosPessoais().getEmailProfissional());
        aluno.setMatriculado(false);
        aluno.getDadosPessoais().setMatricula(null);
        aluno.getDadosPessoais().setEmailProfissional(null);
        repository.save(aluno);
        return aluno;
    }

    @Transactional
    public Aluno vincularSerie(Long id, SerieUnidadeTurmaDto dados) {
        var aluno = repository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", id));

        Serie serie = em.getReference(Serie.class, dados.serieId());
        Unidade unidade = em.getReference(Unidade.class, dados.unidadeId());
        Turma turma = em.getReference(Turma.class, dados.turmaId());

        aluno.setSerie(serie);
        aluno.setUnidade(unidade);
        aluno.setTurma(turma);

        repository.save(aluno);

        return aluno;
    }

    public List<Aluno> recuperarAlunosPorUnidadeSerieTurma(Long unidadeId, Long serieId, Long turmaId) {
        return repository.findByUnidadeIdAndSerieIdAndTurmaIdAndMatriculadoTrue(unidadeId, serieId, turmaId);
    }
}
