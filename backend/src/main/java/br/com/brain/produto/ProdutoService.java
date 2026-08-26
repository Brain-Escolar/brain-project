package br.com.brain.produto;

import java.util.List;

import br.com.brain.exception.ErrosSistema;
import br.com.brain.produto.dto.AtualizacaoProdutoDto;
import br.com.brain.produto.dto.AtualizacaoProdutoModalidadeDto;
import br.com.brain.produto.dto.CadastroProdutoDto;
import br.com.brain.produto.dto.CadastroProdutoModalidadeDto;
import br.com.brain.produto.dto.DetalhamentoProdutoDto;
import br.com.brain.produto.dto.ListagemProdutoDto;
import br.com.brain.produto.dto.ListagemProdutoModalidadeDto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository repository;
    private final ProdutoModalidadeRepository modalidadeRepository;
    private final AlunoProdutoRepository alunoProdutoRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Produto cadastrar(CadastroProdutoDto dados) {
        var produto = new Produto();
        produto.setNome(dados.nome());
        produto.setDescricao(dados.descricao());
        repository.save(produto);
        return produto;
    }

    public Page<ListagemProdutoDto> listar(Pageable paginacao) {
        return repository.findAll(paginacao).map(ListagemProdutoDto::new);
    }

    public DetalhamentoProdutoDto detalhar(Long id) {
        var produto = buscarPorId(id);
        var modalidades = modalidadeRepository.findByProdutoId(id).stream()
                .map(ListagemProdutoModalidadeDto::new)
                .toList();
        return new DetalhamentoProdutoDto(produto, modalidades);
    }

    @Transactional
    public Produto atualizar(Long id, AtualizacaoProdutoDto dados) {
        var produto = buscarPorId(id);

        if (dados.nome() != null) {
            produto.setNome(dados.nome());
        }
        if (dados.descricao() != null) {
            produto.setDescricao(dados.descricao());
        }
        if (dados.ativo() != null) {
            produto.setAtivo(dados.ativo());
        }
        repository.save(produto);

        return produto;
    }

    @Transactional
    public void excluir(Long id) {
        var produto = buscarPorId(id);

        if (alunoProdutoRepository.countByProdutoModalidadeProdutoId(id) > 0) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Não é possível excluir um produto que já possui compras registradas.");
        }

        modalidadeRepository.deleteAll(modalidadeRepository.findByProdutoId(id));
        repository.delete(produto);
    }

    @Transactional
    public ProdutoModalidade adicionarModalidade(Long produtoId, CadastroProdutoModalidadeDto dados) {
        var produto = buscarPorId(produtoId);

        var modalidade = new ProdutoModalidade();
        modalidade.setProduto(produto);
        modalidade.setModalidade(dados.modalidade());
        modalidade.setValor(dados.valor());
        modalidadeRepository.save(modalidade);

        return modalidade;
    }

    public List<ListagemProdutoModalidadeDto> listarModalidades(Long produtoId) {
        return modalidadeRepository.findByProdutoId(produtoId).stream()
                .map(ListagemProdutoModalidadeDto::new)
                .toList();
    }

    @Transactional
    public ProdutoModalidade atualizarModalidade(Long modalidadeId, AtualizacaoProdutoModalidadeDto dados) {
        var modalidade = buscarModalidadePorId(modalidadeId);

        if (dados.modalidade() != null) {
            modalidade.setModalidade(dados.modalidade());
        }
        if (dados.valor() != null) {
            modalidade.setValor(dados.valor());
        }
        if (dados.ativo() != null) {
            modalidade.setAtivo(dados.ativo());
        }
        modalidadeRepository.save(modalidade);

        return modalidade;
    }

    @Transactional
    public void excluirModalidade(Long modalidadeId) {
        var modalidade = buscarModalidadePorId(modalidadeId);

        if (alunoProdutoRepository.countByProdutoModalidadeId(modalidadeId) > 0) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Não é possível excluir uma modalidade que já possui compras registradas.");
        }

        modalidadeRepository.delete(modalidade);
    }

    public Produto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Produto", id));
    }

    public ProdutoModalidade buscarModalidadePorId(Long id) {
        return modalidadeRepository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Modalidade de produto", id));
    }
}
