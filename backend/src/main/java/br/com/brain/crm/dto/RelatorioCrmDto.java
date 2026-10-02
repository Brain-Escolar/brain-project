package br.com.brain.crm.dto;

import java.util.List;

public record RelatorioCrmDto(
        int totalLeads,
        int totalMatriculados,
        int totalPerdidos,
        double conversaoPercentual,
        Double tempoMedioAteMatriculaDias,
        Double tempoMedioAte1ContatoDias,
        List<FunilEtapaRelatorioDto> funil,
        List<OrigemRelatorioDto> origens,
        List<MotivoPerdaRelatorioDto> motivosPerda) {

    public record FunilEtapaRelatorioDto(String estagioNome, long quantidade, Double tempoMedioDias) {
    }

    public record OrigemRelatorioDto(String origemNome, long quantidade, double conversaoPercentual) {
    }

    public record MotivoPerdaRelatorioDto(String motivo, long quantidade, double percentual) {
    }
}
