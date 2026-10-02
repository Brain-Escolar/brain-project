package br.com.brain.fichamedica.dto;

import br.com.brain.medicacao.dto.ListagemMedicacaoDto;

import java.time.LocalDate;
import java.util.List;

public record DetalhamentoFichaMedicaDto(
        Long id,
        String nome,
        LocalDate dataDeNascimento,
        String tipoSanguineo,
        String necessidadesEspeciais,
        String doencasRespiratorias,
        String alergiasAlimentares,
        String alergiasMedicamentosas,
        List<LaudoMedicoDto> laudos,
        List<ListagemMedicacaoDto> medicacoes) {
}
