package br.com.brain.shared.telefone;

import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.shared.domain.EntidadeBase;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;

@Entity
@Audited
@Table(name = "telefones")
@Data
@EqualsAndHashCode(callSuper = false)
public class Telefone extends EntidadeBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "dados_pessoais_id", referencedColumnName = "id")
    private DadosPessoais dadosPessoaisId;
}
