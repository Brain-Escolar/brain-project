package br.com.brain.diretor.painel;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.diretor.painel.dto.AcompanhamentoProfessorDto;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto;
import br.com.brain.diretor.painel.dto.FiltrosAcompanhamentoDto;
import br.com.brain.diretor.painel.dto.InicioDiretorDto;
import br.com.brain.diretor.painel.dto.LembreteProfessoresDto;
import br.com.brain.diretor.painel.dto.LembretesEnviadosDto;
import br.com.brain.diretor.painel.dto.ProfessoresDiretorDto;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

/** Telas da Direção. Acesso restrito a DIRETOR e ADMIN em {@code SecurityConfigurations}. */
@RestController
@RequestMapping("diretor")
@RequiredArgsConstructor
public class PainelDiretorController {

    private final InicioDiretorService inicioService;
    private final AcompanhamentoTurmaService acompanhamentoService;
    private final AcompanhamentoProfessorService professorService;

    /** Painel inicial: indicadores da escola, desempenho por série, frequência mensal e comunicados. */
    @GetMapping("/inicio")
    public ResponseEntity<InicioDiretorDto> inicio(@AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(inicioService.montarInicio(usuario));
    }

    /** Turmas e períodos do ano letivo corrente, para os filtros do acompanhamento. */
    @GetMapping("/acompanhamento-turma/filtros")
    public ResponseEntity<FiltrosAcompanhamentoDto> filtrosAcompanhamento() {
        return ResponseEntity.ok(acompanhamentoService.filtros());
    }

    /** Notas, faltas, atrasos e anotações da turma no recorte de período e disciplina. */
    @GetMapping("/acompanhamento-turma/{turmaId}")
    public ResponseEntity<AcompanhamentoTurmaDto> acompanhamentoTurma(
            @PathVariable Long turmaId,
            @RequestParam(required = false) Integer periodo,
            @RequestParam(required = false) Long disciplinaId) {
        return ResponseEntity.ok(acompanhamentoService.montar(turmaId, periodo, disciplinaId));
    }

    /** Professores com a situação do diário de classe e das notas no período corrente. */
    @GetMapping("/professores")
    public ResponseEntity<ProfessoresDiretorDto> professores() {
        return ResponseEntity.ok(professorService.listar());
    }

    /** Acompanhamento de um professor; {@code semana} é um dia da semana do diário (padrão: a atual). */
    @GetMapping("/professores/{professorId}")
    public ResponseEntity<AcompanhamentoProfessorDto> professor(
            @PathVariable Long professorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate semana) {
        return ResponseEntity.ok(professorService.detalhar(professorId, semana));
    }

    /** Envia aos professores (todos, se nenhum for indicado) um alerta com as suas pendências. */
    @PostMapping("/professores/lembretes")
    public ResponseEntity<LembretesEnviadosDto> lembrarProfessores(
            @RequestBody(required = false) LembreteProfessoresDto dados) {
        return ResponseEntity.ok(professorService.enviarLembretes(dados != null ? dados.professorIds() : null));
    }
}
