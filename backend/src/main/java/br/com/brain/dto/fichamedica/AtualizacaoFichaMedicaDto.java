package br.com.brain.dto.fichamedica;

public record AtualizacaoFichaMedicaDto(
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas) {
}
