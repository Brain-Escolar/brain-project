package br.com.brain.professor;
import br.com.brain.configuracaoAcademica.AnoLetivoService;
import br.com.brain.dependente.DependenteService;
import br.com.brain.endereco.EnderecoService;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.dadosPessoais.DadosPessoaisService;
import br.com.brain.enums.PerfilNome;
import br.com.brain.usuario.UsuarioService;
import br.com.brain.aula.dto.ListagemAulaDto;
import br.com.brain.professor.dto.AtualizacaoProfessorDto;
import br.com.brain.professor.dto.CadastroProfessorDto;
import br.com.brain.professor.dto.ListagemProfessorDto;
import br.com.brain.exception.ErrosSistema;
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
public class ProfessorService {

    private final ProfessorRepository repository;
    private final AnoLetivoService anoLetivoService;
    private final EnderecoService enderecoService;
    private final DependenteService dependenteService;
    private final DadosPessoaisService dadosPessoaisService;
    private final UsuarioService usuarioService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Professor cadastrarProfessor(CadastroProfessorDto dados) {

        var professor = new Professor();
        var dadosPessoais = new DadosPessoais();

        dadosPessoais.setCpf(dados.cpf());
        dadosPessoais.setNome(dados.nome());
        dadosPessoais.setNomeSocial(dados.nomeSocial());
        dadosPessoais.setEmail(dados.email());
        dadosPessoais.setDataDeNascimento(dados.dataDeNascimento());
        dadosPessoais.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
        dadosPessoais.setGenero(dados.genero());
        dadosPessoais.setCorRaca(dados.corRaca());
        dadosPessoais.setRg(dados.rg());
        dadosPessoais.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());
        dadosPessoais.setCidadeNaturalidade(dados.cidadeNaturalidade());
        dadosPessoais.setTelefones(dados.telefones());

        // A pessoa pode ja existir em outro papel (ex.: responsavel).
        dadosPessoais = dadosPessoaisService.reaproveitarOuCriar(dadosPessoais);
        garantirQueNaoEProfessor(dadosPessoais);
        // Quem ja e aluno mantem a matricula que tem.
        if (dadosPessoais.getMatricula() == null) {
            dadosPessoais.setMatricula("M" + dados.cpf());
        }
        professor.setDadosPessoais(dadosPessoais);

        repository.save(professor);

        if (dados.dependentes() != null) {
            for (var dependente : dados.dependentes()) {
                dependenteService.cadastrarDependente(dadosPessoais.getId(), dependente);
            }
        }
        return professor;
    }

    private void garantirQueNaoEProfessor(DadosPessoais dadosPessoais) {
        repository.findByDadosPessoaisId(dadosPessoais.getId()).ifPresent(existente -> {
            if (Boolean.FALSE.equals(existente.getAtivo())) {
                throw ErrosSistema.OperacaoInvalidaException.com(
                        dadosPessoais.getNome() + " já foi professor(a) e está inativo(a). Reative o cadastro na lista de professores.");
            }
            throw new ErrosSistema.RecursoJaExisteException(
                    dadosPessoais.getNome() + " já está cadastrado(a) como professor(a).");
        });
    }

    public Page<ListagemProfessorDto> listar(Pageable paginacao) {
        return repository.findByAtivoTrue(paginacao).map(ListagemProfessorDto::new);
    }

    @Transactional
    public Professor atualizar(AtualizacaoProfessorDto dados, Long id) {
        var professor = repository
                .findByIdAndAtivoTrue(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Professor", id));

        var dadosPessoais = professor.getDadosPessoais();
        dadosPessoais.atualizarNome(dados.nome());
        dadosPessoais.atualizarDataDeNascimento(dados.dataDeNascimento());
        dadosPessoais.atualizarEmail(dados.email());
        var endereco = enderecoService.atualizarEndereco(dadosPessoais.getEndereco(), dados.endereco());
        dadosPessoais.atualizarEndereco(endereco);

        repository.save(professor);

        return professor;
    }

    @Transactional
    public void excluir(Long id) {
        var professor = repository
                .findByIdAndAtivoTrue(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Professor", id));
        professor.setAtivo(false);
        repository.save(professor);
        // Desligado nao entra mais como professor, mas mantem os outros papeis
        // (ex.: responsavel). Sem isso o login seguia com acesso as turmas.
        usuarioService.revogarPerfil(professor.getDadosPessoais(), PerfilNome.PROFESSOR);
    }

    public Professor detalhar(Long id) {
        return repository
                .findByIdAndAtivoTrue(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Professor", id));
    }

    public List<ListagemAulaDto> gerarGradeHoraria(String matricula) {
        return repository.gerarGradeHoraria(matricula, anoLetivoService.anoEmContexto());
    }

    public Professor recuperarProfessorPorDadosPessoais(Long dadosPessoaisId) {
        // Professor logado: o desligado nao enxerga mais turmas, aulas e alunos.
        return repository.findByDadosPessoaisIdAndAtivoTrue(dadosPessoaisId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Professor", dadosPessoaisId));
    }

    @Transactional
    public Professor reativar(Long id) {
        var professor = repository
                .findByIdAndAtivoFalse(id)
                .orElseThrow(
                        () -> ErrosSistema.RecursoNaoEncontradoException.para("Professor", id));
        professor.setAtivo(true);
        repository.save(professor);
        usuarioService.concederPerfil(professor.getDadosPessoais(), PerfilNome.PROFESSOR,
                professor.getDadosPessoais().getCpf());
        return professor;
    }
}
