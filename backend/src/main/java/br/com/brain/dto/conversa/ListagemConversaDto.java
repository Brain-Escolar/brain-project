package br.com.brain.dto.conversa;

import br.com.brain.domain.conversa.Conversa;
import br.com.brain.enums.StatusConversa;

import java.time.Instant;

public record ListagemConversaDto(
        Long id,
        Long remetenteId,
        String remetenteNome,
        String remetentePerfilNome,
        String destinatarioPerfilNome,
        StatusConversa status,
        Instant criadoEm) {

    public ListagemConversaDto(Conversa conversa) {
        this(
                conversa.getId(),
                conversa.getRemetente().getId(),
                conversa.getRemetente().getNome(),
                conversa.getRemetentePerfil().getNome().name(),
                conversa.getDestinatario().getNome().name(),
                conversa.getStatus(),
                conversa.getCriadoEm());
    }
}
