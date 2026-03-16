package br.com.brain.dto.fichamedica;

import br.com.brain.domain.fichamedica.FichaMedica;

public record ListagemFichaMedicaDto(
        Long id,
        String nome,
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas) {

    public ListagemFichaMedicaDto(FichaMedica ficha) {
        this(
                ficha.getId(),
                ficha.getDadosPessoais().getNome(),
                ficha.getTipoSanguineo().getTipo(),
                ficha.getNecessidadesEspeciais(),
                ficha.getDoencasRespiratorias(),
                ficha.getAlergiasAlimentares(),
                ficha.getAlergiasMedicamentosas());
    }
}
