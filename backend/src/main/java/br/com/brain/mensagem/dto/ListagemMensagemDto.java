package br.com.brain.mensagem.dto;

import br.com.brain.mensagem.Mensagem;

import java.time.Instant;

public record ListagemMensagemDto(
        Long id,
        Long remetenteId,
        String remetenteNome,
        String conteudo,
        Instant criadoEm) {

    public ListagemMensagemDto(Mensagem mensagem) {
        this(
                mensagem.getId(),
                mensagem.getRemetente().getId(),
                mensagem.getRemetente().getNome(),
                mensagem.getConteudo(),
                mensagem.getCriadoEm());
    }
}
