package br.com.brain.produto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import br.com.brain.enums.StatusAlunoProduto;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.produto.dto.CadastroAlunoProdutoDto;
import br.com.brain.produto.dto.ListagemAlunoProdutoDto;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import br.com.brain.aluno.Aluno;

@Service
@RequiredArgsConstructor
public class AlunoProdutoService {

    private final AlunoProdutoRepository repository;
    private final ProdutoService produtoService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public AlunoProduto comprar(Long produtoModalidadeId, CadastroAlunoProdutoDto dados) {
        var modalidade = produtoService.buscarModalidadePorId(produtoModalidadeId);
        var desconto = dados.desconto() != null ? dados.desconto() : BigDecimal.ZERO;

        var compra = new AlunoProduto();
        compra.setAluno(em.getReference(Aluno.class, dados.alunoId()));
        compra.setProdutoModalidade(modalidade);
        compra.setDesconto(desconto);
        compra.setValorPago(modalidade.getValor().subtract(desconto));
        compra.setDataCompra(dados.dataCompra() != null ? dados.dataCompra() : LocalDate.now());
        repository.save(compra);

        return compra;
    }

    public List<ListagemAlunoProdutoDto> listarPorModalidade(Long produtoModalidadeId) {
        return repository.findByProdutoModalidadeId(produtoModalidadeId).stream()
                .map(ListagemAlunoProdutoDto::new)
                .toList();
    }

    public List<ListagemAlunoProdutoDto> listarPorAluno(Long alunoId) {
        return repository.findByAlunoId(alunoId).stream()
                .map(ListagemAlunoProdutoDto::new)
                .toList();
    }

    @Transactional
    public AlunoProduto cancelar(Long id) {
        var compra = repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Compra", id));

        compra.setStatus(StatusAlunoProduto.CANCELADO);
        repository.save(compra);

        return compra;
    }
}
