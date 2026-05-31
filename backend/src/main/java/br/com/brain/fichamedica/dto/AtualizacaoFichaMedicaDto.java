package br.com.brain.fichamedica.dto;

public record AtualizacaoFichaMedicaDto(
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas) {
}
