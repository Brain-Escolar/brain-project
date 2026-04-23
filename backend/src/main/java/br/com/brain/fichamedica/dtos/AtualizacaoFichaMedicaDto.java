package br.com.brain.fichamedica.dtos;

public record AtualizacaoFichaMedicaDto(
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas) {
}
