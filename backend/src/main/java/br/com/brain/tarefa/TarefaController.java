package br.com.brain.tarefa;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.tarefa.dto.AtualizacaoTarefaDto;
import br.com.brain.tarefa.dto.CadastroTarefaDto;
import br.com.brain.tarefa.dto.CadastroTarefaConteudoLoteDto;
import br.com.brain.tarefa.dto.ListagemTarefaDto;
import br.com.brain.tarefa.dto.LoteRegistradoDto;
import br.com.brain.professor.ProfessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("tarefa")
@RequiredArgsConstructor
public class TarefaController {

    private final TarefaService service;
    private final ProfessorService professorService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListagemTarefaDto> cadastrar(
            @RequestPart("dados") @Valid CadastroTarefaDto dados,
            @RequestPart(value = "arquivo", required = false) MultipartFile arquivo,
            UriComponentsBuilder uriBuilder,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var dto = service.cadastrarTarefa(dados, arquivo, professor);
        var uri = uriBuilder.path("/tarefa/{id}").buildAndExpand(dto.id()).toUri();
        return ResponseEntity.created(uri).body(dto);
    }

    @GetMapping
    public ResponseEntity<Page<ListagemTarefaDto>> listar(
            @PageableDefault(size = 10, sort = { "prazo" }) Pageable paginacao) {
        return ResponseEntity.ok(service.listar(paginacao));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListagemTarefaDto> atualizar(
            @PathVariable Long id,
            @RequestPart("dados") @Valid AtualizacaoTarefaDto dados,
            @RequestPart(value = "arquivo", required = false) MultipartFile arquivo) {
        return ResponseEntity.ok(service.atualizar(dados, id, arquivo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemTarefaDto> detalhar(@PathVariable Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping(value = "/lote", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LoteRegistradoDto> cadastrarLote(
            @RequestPart("dados") @Valid CadastroTarefaConteudoLoteDto dados,
            @RequestPart(value = "arquivo", required = false) MultipartFile arquivo,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var resultado = service.cadastrarTarefaLote(dados, arquivo, professor);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/professor")
    public ResponseEntity<Page<ListagemTarefaDto>> recuperarTarefas(
            @PageableDefault(size = 10, sort = { "dataCriacao" }, direction = Direction.DESC) Pageable paginacao,
            @RequestParam(value = "historico", required = false, defaultValue = "false") boolean historico,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var tarefas = historico
                ? service.recuperarTodasTarefasProfessor(professor.getId(), paginacao)
                : service.recuperarTarefasProfessor(professor.getId(), paginacao);
        return ResponseEntity.ok(tarefas);
    }
}
