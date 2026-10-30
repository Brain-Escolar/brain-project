package br.com.brain.diretor.painel.dto;

import br.com.brain.comunicado.dto.ListagemComunicadoDto;

import java.util.List;

/** Payload único de {@code GET /diretor/inicio} — uma chamada só para a tela não abrir em cascata. */
public record InicioDiretorDto(
        IndicadoresDiretorDto indicadores,
        List<DesempenhoSerieDto> desempenhoPorSerie,
        List<FrequenciaMensalDto> frequenciaMensal,
        List<ListagemComunicadoDto> comunicados) {
}
