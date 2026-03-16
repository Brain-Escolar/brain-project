package br.com.brain.dto.fichamedica;

import jakarta.validation.constraints.NotNull;

public record CadastroFichaMedicaDto(
        @NotNull Long dadosPessoaisId,
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas) {
}
