package br.com.brain.conversa.dto;

import br.com.brain.conversa.Conversa;
import br.com.brain.enums.StatusConversa;

import java.time.Instant;

public record ListagemConversaDto(
        Long id,
        String titulo,
        Long remetenteId,
        String remetenteNome,
        String remetentePerfilNome,
        String destinatarioPerfilNome,
        StatusConversa status,
        Instant criadoEm,
        long mensagensNaoLidas) {

    public ListagemConversaDto(Conversa conversa, long mensagensNaoLidas) {
        this(
                conversa.getId(),
                conversa.getTitulo(),
                conversa.getRemetente().getId(),
                conversa.getRemetente().getNome(),
                conversa.getRemetentePerfil().getNome().name(),
                conversa.getDestinatario().getNome().name(),
                conversa.getStatus(),
                conversa.getCriadoEm(),
                mensagensNaoLidas);
    }
}
