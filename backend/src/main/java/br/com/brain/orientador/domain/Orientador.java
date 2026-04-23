package br.com.brain.orientador.domain;


import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.shared.domain.EntidadeBase;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;


@Entity
@Audited
@Table(name = "orientadores")
@Data
@EqualsAndHashCode(callSuper = false)
public class Orientador extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dados_pessoais_id", referencedColumnName = "id")
    private DadosPessoais dadosPessoais;
}
