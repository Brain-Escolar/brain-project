package br.com.brain.relatorios;

import br.com.brain.aluno.AlunoService;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.relatorios.dto.RelatorioDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("relatorios")
@RequiredArgsConstructor
public class RelatoriosController {

    private final RelatoriosService relatoriosService;
    private final AlunoService alunoService;

    /** Relatórios (notas e frequência) do aluno autenticado. */
    @GetMapping
    public ResponseEntity<RelatorioDto> buscarMeusRelatorios(@AuthenticationPrincipal DadosAutenticacao usuario) {
        var aluno = alunoService.recuperarAlunoPorDadosPessoais(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(relatoriosService.gerarRelatorio(aluno));
    }

    /** Relatórios de um aluno específico (visão de professor/secretaria/coordenação). */
    @GetMapping("/aluno/{id}")
    public ResponseEntity<RelatorioDto> buscarRelatoriosDoAluno(@PathVariable Long id) {
        var aluno = alunoService.detalhar(id);
        return ResponseEntity.ok(relatoriosService.gerarRelatorio(aluno));
    }
}
