package br.com.brain.diretor.painel;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.diretor.painel.dto.AcompanhamentoTurmaDto;
import br.com.brain.diretor.painel.dto.FiltrosAcompanhamentoDto;
import br.com.brain.diretor.painel.dto.InicioDiretorDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Telas da Direção. Acesso restrito a DIRETOR e ADMIN em {@code SecurityConfigurations}. */
@RestController
@RequestMapping("diretor")
@RequiredArgsConstructor
public class PainelDiretorController {

    private final InicioDiretorService inicioService;
    private final AcompanhamentoTurmaService acompanhamentoService;

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
}
