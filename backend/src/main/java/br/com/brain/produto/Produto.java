package br.com.brain.produto;

import java.util.List;

import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import br.com.brain.shared.EntidadeBase;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Audited
@Table(name = "produtos")
@Data
@EqualsAndHashCode(callSuper = false)
public class Produto extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String descricao;

    private Boolean ativo = true;

    @NotAudited
    @OneToMany(mappedBy = "produto", fetch = FetchType.LAZY)
    private List<ProdutoModalidade> modalidades;
}
