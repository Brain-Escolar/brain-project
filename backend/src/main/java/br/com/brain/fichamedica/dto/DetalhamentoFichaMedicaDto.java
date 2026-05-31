package br.com.brain.fichamedica.dto;

import br.com.brain.arquivo.dto.ListagemArquivoDto;

import java.util.List;

public record DetalhamentoFichaMedicaDto(
        Long id,
        String nome,
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas,
        List<ListagemArquivoDto> laudos) {
}
