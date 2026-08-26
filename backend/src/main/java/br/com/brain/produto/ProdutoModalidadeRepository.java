package br.com.brain.produto;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoModalidadeRepository extends JpaRepository<ProdutoModalidade, Long> {

    List<ProdutoModalidade> findByProdutoId(Long produtoId);
}
