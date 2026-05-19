package br.com.brain.dto.mensagem;

import br.com.brain.domain.mensagem.Mensagem;

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
