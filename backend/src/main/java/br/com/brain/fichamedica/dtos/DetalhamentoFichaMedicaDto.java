package br.com.brain.fichamedica.dtos;

import br.com.brain.shared.arquivo.ListagemArquivoDto;

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
