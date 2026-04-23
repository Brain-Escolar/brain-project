package br.com.brain.fichamedica.dtos;

import jakarta.validation.constraints.NotNull;

public record CadastroFichaMedicaDto(
        @NotNull Long dadosPessoaisId,
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas) {
}
