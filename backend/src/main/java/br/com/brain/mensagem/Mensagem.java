package br.com.brain.mensagem;

import br.com.brain.shared.EntidadeBase;
import br.com.brain.conversa.Conversa;
import br.com.brain.dadosPessoais.DadosPessoais;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.util.ArrayList;
import java.util.List;

@Entity
@Audited
@Table(name = "mensagens")
@Data
@EqualsAndHashCode(callSuper = false)
public class Mensagem extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversa_id", nullable = false)
    private Conversa conversa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remetente_dados_pessoais_id", nullable = false)
    private DadosPessoais remetente;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    @NotAudited
    @OneToMany(mappedBy = "mensagem", fetch = FetchType.LAZY)
    private List<MensagemLida> leituras = new ArrayList<>();
}
