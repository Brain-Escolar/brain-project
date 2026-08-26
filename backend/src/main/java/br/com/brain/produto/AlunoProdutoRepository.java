package br.com.brain.produto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AlunoProdutoRepository extends JpaRepository<AlunoProduto, Long> {

    List<AlunoProduto> findByProdutoModalidadeId(Long produtoModalidadeId);

    List<AlunoProduto> findByAlunoId(Long alunoId);

    long countByProdutoModalidadeId(Long produtoModalidadeId);

    long countByProdutoModalidadeProdutoId(Long produtoId);
}
