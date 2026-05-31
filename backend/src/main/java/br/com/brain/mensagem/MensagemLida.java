package br.com.brain.mensagem;

import br.com.brain.dadosPessoais.DadosPessoais;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Entity
@Table(name = "mensagens_lidas")
@IdClass(MensagemLidaId.class)
@Data
public class MensagemLida {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mensagem_id")
    private Mensagem mensagem;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dados_pessoais_id")
    private DadosPessoais dadosPessoais;

    @Column(name = "lida_em", nullable = false)
    private Instant lidaEm = Instant.now();
}
