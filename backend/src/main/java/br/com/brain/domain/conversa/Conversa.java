package br.com.brain.domain.conversa;

import br.com.brain.domain.EntidadeBase;
import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.mensagem.Mensagem;
import br.com.brain.domain.perfil.Perfil;
import br.com.brain.enums.StatusConversa;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import java.util.ArrayList;
import java.util.List;

@Entity
@Audited
@Table(name = "conversas")
@Data
@EqualsAndHashCode(callSuper = false)
public class Conversa extends EntidadeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remetente_dados_pessoais_id", nullable = false)
    private DadosPessoais remetente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remetente_perfil_id", nullable = false)
    private Perfil remetentePerfil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "perfil_destinatario_id", nullable = false)
    private Perfil destinatario;

    @Column(nullable = false)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusConversa status = StatusConversa.ABERTA;

    @NotAudited
    @OneToMany(mappedBy = "conversa", fetch = FetchType.LAZY)
    private List<Mensagem> mensagens = new ArrayList<>();
}
