package br.com.brain.fichamedica.dto;

import jakarta.validation.constraints.NotNull;

public record CadastroFichaMedicaDto(
        @NotNull Long dadosPessoaisId,
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas) {
}
