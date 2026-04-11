package br.com.brain.dto.fichamedica;

import br.com.brain.dto.arquivo.ListagemArquivoDto;

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
