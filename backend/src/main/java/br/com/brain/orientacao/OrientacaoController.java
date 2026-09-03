package br.com.brain.orientacao;

import br.com.brain.aluno.dto.ListagemAlunoDto;
import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.orientacao.dto.InicioOrientacaoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("orientacao")
@RequiredArgsConstructor
public class OrientacaoController {

    private final OrientacaoService service;

    /** Tela inicial da Orientação: indicadores, atendimentos e comunicados recentes. */
    @GetMapping("/inicio")
    public ResponseEntity<InicioOrientacaoDto> inicio(@AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.montarInicio(usuario.getDadosPessoais().getId()));
    }

    /** Busca de alunos matriculados por nome ou matrícula, com filtros opcionais. */
    @GetMapping("/alunos")
    public ResponseEntity<Page<ListagemAlunoDto>> buscarAlunos(
            @RequestParam(required = false) String termo,
            @RequestParam(required = false) Long unidadeId,
            @RequestParam(required = false) Long serieId,
            @RequestParam(required = false) Long turmaId,
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        return ResponseEntity.ok(service.buscarAlunos(termo, unidadeId, serieId, turmaId, paginacao));
    }
}
