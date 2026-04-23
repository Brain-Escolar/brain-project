package br.com.brain.relatorio.dtos;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FiltroRelatorioDto {
    private List<FiltroUnidadeDto> unidades = new ArrayList<>();
    private List<FiltroSerieDto> series = new ArrayList<>();
    private List<FiltroTurmaDto> turmas = new ArrayList<>();
    private List<FiltroDisciplinaDto> disciplinas = new ArrayList<>();
}
