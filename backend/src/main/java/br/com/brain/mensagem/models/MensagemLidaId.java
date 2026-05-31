package br.com.brain.mensagem.models;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class MensagemLidaId implements Serializable {
    private Long mensagem;
    private Long dadosPessoais;
}
