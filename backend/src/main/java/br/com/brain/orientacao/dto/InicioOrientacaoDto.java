package br.com.brain.orientacao.dto;

import br.com.brain.comunicado.dto.ListagemComunicadoDto;
import br.com.brain.conversa.dto.ListagemConversaDto;

import java.util.List;

/**
 * Payload único da tela inicial da Orientação: indicadores, atendimentos
 * (conversas do "Fale conosco" dirigidas ao perfil ORIENTADOR) e comunicados
 * recentes. Uma chamada só para a tela não abrir em cascata.
 */
public record InicioOrientacaoDto(
        IndicadoresOrientacaoDto indicadores,
        List<ListagemConversaDto> atendimentos,
        List<ListagemComunicadoDto> comunicados) {
}
