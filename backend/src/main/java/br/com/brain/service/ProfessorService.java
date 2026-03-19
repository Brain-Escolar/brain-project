package br.com.brain.service;

import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.professor.Professor;
import br.com.brain.domain.professor.ProfessorRepository;
import br.com.brain.dto.aula.ListagemAulaDto;
import br.com.brain.dto.professor.AtualizacaoProfessorDto;
import br.com.brain.dto.professor.CadastroProfessorDto;
import br.com.brain.dto.professor.ListagemProfessorDto;
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
    private final EnderecoService enderecoService;

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
        dadosPessoais.setEmailProfissional(dados.cpf() + "@gmail.com");
        dadosPessoais.setDataDeNascimento(dados.dataDeNascimento());
        dadosPessoais.setEndereco(enderecoService.preencherEnderco(dados.endereco()));
        dadosPessoais.setGenero(dados.genero());
        dadosPessoais.setCorRaca(dados.corRaca());
        dadosPessoais.setRg(dados.rg());
        dadosPessoais.setMatricula("M" + dados.cpf());
        dadosPessoais.setCarteiraDeTrabalho(dados.carteiraDeTrabalho());
        dadosPessoais.setCidadeNaturalidade(dados.cidadeNaturalidade());
        dadosPessoais.setTelefones(dados.telefones());
        professor.setDadosPessoais(dadosPessoais);

        repository.save(professor);

        return professor;
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
    }

    public Professor detalhar(Long id) {
        return repository
                .findByIdAndAtivoTrue(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Professor", id));
    }

    public List<ListagemAulaDto> gerarGradeHoraria(String matricula) {
        return repository.gerarGradeHoraria(matricula);
    }

    public Professor recuperarProfessorPorDadosPessoais(Long dadosPessoaisId) {
        return repository.findByDadosPessoaisId(dadosPessoaisId)
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
        return professor;
    }
}
