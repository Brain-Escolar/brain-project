package br.com.brain.fichamedica.dto;

import java.util.List;

public record DetalhamentoFichaMedicaDto(
        Long id,
        String nome,
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas,
        List<LaudoMedicoDto> laudos,
        List<MedicacaoDto> medicacoes) {
}
