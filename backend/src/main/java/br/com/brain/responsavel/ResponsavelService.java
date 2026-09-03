package br.com.brain.responsavel;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoaisService;
import br.com.brain.endereco.EnderecoService;
import br.com.brain.enums.PerfilNome;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.usuario.UsuarioService;

import br.com.brain.aluno.Aluno;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.responsavel.dto.AtualizacaoResponsavelDto;
import br.com.brain.responsavel.dto.CadastroResponsavelDto;
import br.com.brain.responsavel.dto.ListagemResponsavelDto;
import br.com.brain.exception.ErrosSistema;
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
    private final UsuarioService usuarioService;
    private final PerfilRepository perfilRepository;
    private final DadosAutenticacaoRepository dadosAutenticacaoRepository;

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
        garantirAcessoAoPortal(dadosPessoais);

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
        // Cobre o responsavel cadastrado antes desta funcionalidade existir:
        // ao ganhar um vinculo, ele ganha o acesso ao portal.
        garantirAcessoAoPortal(responsavel.getDadosPessoais());
        return responsavel;
    }

    /**
     * Garante que o responsavel consiga entrar no Portal do Responsavel.
     *
     * Sem isto o perfil RESPONSAVEL existe no enum e na migration mas nunca e
     * atribuido a ninguem, e nenhum responsavel tem DadosAutenticacao — o
     * portal inteiro fica inalcancavel.
     *
     * Idempotente de proposito: um responsavel com dois filhos passa por aqui
     * duas vezes, e quem ja tem login (inclusive um professor que tambem e
     * responsavel) so ganha o perfil, nunca um segundo acesso.
     *
     * O login e o e-mail pessoal e a senha inicial e o CPF — mesmo padrao que
     * AlunoService.matricular usa para o estudante. O e-mail de verificacao
     * sai no cadastro; a conta so fica ativa depois que a pessoa confirma.
     */
    private void garantirAcessoAoPortal(DadosPessoais dadosPessoais) {
        if (dadosPessoais == null || dadosPessoais.getId() == null) {
            return;
        }

        var jaTemPerfil = dadosPessoais.getPerfis().stream()
                .anyMatch(perfil -> PerfilNome.RESPONSAVEL.equals(perfil.getNome()));

        if (dadosAutenticacaoRepository.existsByDadosPessoaisId(dadosPessoais.getId())) {
            if (!jaTemPerfil) {
                dadosPessoais.getPerfis().add(perfilRepository.findByNome(PerfilNome.RESPONSAVEL));
                dadosPessoaisService.salvar(dadosPessoais);
            }
            return;
        }

        usuarioService.cadastrarUsuario(
                dadosPessoais,
                PerfilNome.RESPONSAVEL,
                dadosPessoais.getCpf(),
                dadosPessoais.getEmail());
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
