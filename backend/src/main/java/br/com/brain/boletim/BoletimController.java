package br.com.brain.boletim;

import br.com.brain.aluno.AlunoService;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.boletim.dto.BoletimDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("boletim")
@RequiredArgsConstructor
public class BoletimController {

    private final BoletimService boletimService;
    private final AlunoService alunoService;

    /** Boletim do aluno autenticado. */
    @GetMapping
    public ResponseEntity<BoletimDto> buscarMeuBoletim(@AuthenticationPrincipal DadosAutenticacao usuario) {
        var aluno = alunoService.recuperarAlunoPorDadosPessoais(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(boletimService.gerarBoletim(aluno));
    }

    /** Boletim de um aluno específico (visão de professor/secretaria/coordenação). */
    @GetMapping("/aluno/{id}")
    public ResponseEntity<BoletimDto> buscarBoletimDoAluno(@PathVariable Long id) {
        var aluno = alunoService.detalhar(id);
        return ResponseEntity.ok(boletimService.gerarBoletim(aluno));
    }
}
