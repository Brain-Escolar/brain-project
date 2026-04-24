package br.com.brain.relatorio.services;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import br.com.brain.aula.domain.Aula;
import br.com.brain.autenticacao.domain.DadosAutenticacao;
import br.com.brain.turma.domain.Turma;
import br.com.brain.relatorio.dtos.FiltroDisciplinaDto;
import br.com.brain.relatorio.dtos.FiltroRelatorioDto;
import br.com.brain.relatorio.dtos.FiltroSerieDto;
import br.com.brain.relatorio.dtos.FiltroTurmaDto;
import br.com.brain.relatorio.dtos.FiltroUnidadeDto;
import br.com.brain.aula.services.AulaService;
import br.com.brain.professor.services.ProfessorService;
import br.com.brain.usuario.services.UsuarioService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final UsuarioService usuarioService;
    private final ProfessorService professorService;
    private final AulaService aulaService;

    public List<Integer> recuperarAnosDeAtividadePorUsuario(DadosAutenticacao usuarioLogado) {
        var usuario = usuarioService.recuperarUsuarioLogado(usuarioLogado);
        var anoInicial = usuario.getAtualizadoEm().atZone(ZoneOffset.UTC).getYear();
        var anoAtual = Instant.now().atZone(ZoneOffset.UTC).getYear();
        var anos = new ArrayList<Integer>();
        for (int i = anoInicial; i <= anoAtual; i++) {
            anos.add(i);
        }
        return anos;
    }

    @Transactional
    public List<FiltroRelatorioDto> recuperarFiltrosProfessor(DadosAutenticacao usuarioLogado, Integer ano) {
        var usuario = usuarioService.recuperarUsuarioLogado(usuarioLogado);
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        List<Aula> aulas = aulaService.recuperarAulasPorProfessorEAno(professor.getId(), ano);
        return popularFiltros(aulas);
    }

    private List<FiltroRelatorioDto> popularFiltros(List<Aula> aulas) {
        var filtros = new ArrayList<FiltroRelatorioDto>();
        for (var aula : aulas) {
            var disciplina = aula.getDisciplina();
            var filtro = new FiltroRelatorioDto();
            var disciplinaDto = new FiltroDisciplinaDto(disciplina.getId(), disciplina.getNome(),
                    disciplina.getSerie().getId());
            var unidadeDto = new FiltroUnidadeDto(aula.getTurma().getUnidade().getId(),
                    aula.getTurma().getUnidade().getNome());
            var serieDto = new FiltroSerieDto(aula.getTurma().getSerie().getId(), aula.getTurma().getSerie().getNome(),
                    aula.getTurma().getUnidade().getId());
            List<Turma> turmas = aulaService.recuperarTurmasPorDisciplina(disciplina.getId());
            turmas.forEach(turma -> {
                var turmaDto = new FiltroTurmaDto(turma.getId(), turma.getNome(), disciplina.getId());
                filtro.getTurmas().add(turmaDto);
            });
            filtro.setDisciplinas(List.of(disciplinaDto));
            filtro.setUnidades(List.of(unidadeDto));
            filtro.setSeries(List.of(serieDto));
            filtros.add(filtro);
        }
        return filtros;
    }

}
