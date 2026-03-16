package br.com.brain.controller;

import br.com.brain.dto.aula.ListagemAulaDto;
import br.com.brain.service.AlunoService;
import br.com.brain.service.ProfessorService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("grade-horaria")
public class GradeHorariaController {

    private final AlunoService alunoService;
    private final ProfessorService professorService;

    @GetMapping("/aluno/{matricula}")
    public ResponseEntity<List<ListagemAulaDto>> gerarGradeHorariaAluno(
            @PathVariable("matricula") String matricula) {
        var aulas = alunoService.gerarGradeHoraria(matricula);
        return ResponseEntity.ok(aulas);
    }

    @GetMapping("/professor/{matricula}")
    public ResponseEntity<List<ListagemAulaDto>> gerarGradeHorariaProfessor(
            @PathVariable("matricula") String matricula) {
        var aulas = professorService.gerarGradeHoraria(matricula);
        return ResponseEntity.ok(aulas);
    }
}
