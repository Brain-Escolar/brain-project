package br.com.brain.controller;

import br.com.brain.domain.autenticacao.DadosAutenticacao;
import br.com.brain.dto.DataDto;
import br.com.brain.dto.MultipleUris;
import br.com.brain.dto.aula.ListagemAulaDto;
import br.com.brain.dto.disponibilidadeProfessor.AtualizacaoDisponibilidadeProfessorDto;
import br.com.brain.dto.disponibilidadeProfessor.CadastroDisponibilidadeProfessorDto;
import br.com.brain.dto.disponibilidadeProfessor.ListagemDisponibilidadeProfessorDto;
import br.com.brain.dto.evento.ListagemEventoDto;
import br.com.brain.dto.professor.AtualizacaoProfessorDto;
import br.com.brain.dto.professor.CadastroProfessorDto;
import br.com.brain.dto.professor.DetalhamentoProfessorDto;
import br.com.brain.dto.professor.ListagemProfessorDto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.service.AulaService;
import br.com.brain.service.DisponibilidadeProfessorService;
import br.com.brain.service.EventoService;
import br.com.brain.service.ProfessorService;
import br.com.brain.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("professor")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService service;
    private final DisponibilidadeProfessorService disponibilidadeProfessorService;
    private final UsuarioService usuarioService;
    private final AulaService aulaService;
    private final EventoService eventoService;

    @PostMapping
    public ResponseEntity<DetalhamentoProfessorDto> cadastrar(
            @RequestBody @Valid CadastroProfessorDto dados, UriComponentsBuilder uriBuilder) {
        var professor = service.cadastrarProfessor(dados);
        usuarioService.cadastrarUsuario(professor.getDadosPessoais(), PerfilNome.PROFESSOR, dados.cpf());
        var uri = uriBuilder.path("/professor/{id}").buildAndExpand(professor.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoProfessorDto(professor));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemProfessorDto>> listar(
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        var page = service.listar(paginacao);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoProfessorDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoProfessorDto dados) {
        var professor = service.atualizar(dados, id);
        return ResponseEntity.ok(new DetalhamentoProfessorDto(professor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<DetalhamentoProfessorDto> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reativar/{id}")
    public ResponseEntity<DetalhamentoProfessorDto> reativar(@PathVariable("id") Long id) {
        var professor = service.reativar(id);
        return ResponseEntity.ok(new DetalhamentoProfessorDto(professor));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoProfessorDto> detalhar(@PathVariable("id") Long id) {
        var professor = service.detalhar(id);
        return ResponseEntity.ok(new DetalhamentoProfessorDto(professor));
    }

    @PostMapping("/aulas")
    public ResponseEntity<Page<ListagemAulaDto>> recuperarAulas(@AuthenticationPrincipal DadosAutenticacao usuario,
            @RequestBody @Valid DataDto data,
            @PageableDefault(size = 10, sort = { "horario.horarioInicio" }) Pageable paginacao) {

        var professor = service.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var aulas = aulaService.recuperarAulasPeloProfessorEData(professor.getId(), data.data(), paginacao);
        return ResponseEntity.ok(aulas);
    }

    @GetMapping("/planejamento")
    public ResponseEntity<Page<ListagemEventoDto>> planejamento(@AuthenticationPrincipal DadosAutenticacao usuario,
            @PageableDefault(size = 10) Pageable paginacao) {
        var professor = service.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var eventos = eventoService.listarEventosProfessor(professor.getId(), paginacao);
        return ResponseEntity.ok(eventos);
    }

    @PostMapping("/{professorId}/disponibilidade")
    public ResponseEntity<List<MultipleUris>> cadastrarDisponibilidade(@PathVariable("professorId") Long professorId,
            @RequestBody @Valid CadastroDisponibilidadeProfessorDto dados, UriComponentsBuilder uriBuilder) {
        var disponibilidades = disponibilidadeProfessorService.cadastrarDisponibilidadeProfessor(professorId, dados);
        var uris = new ArrayList<MultipleUris>();
        for (var disponibilidadeProfessor : disponibilidades) {
            uris.add(new MultipleUris(disponibilidadeProfessor.getId(),
                    "/professor/" + disponibilidadeProfessor.getProfessor().getId() + "/disponibilidade/"
                            + disponibilidadeProfessor.getId()));
        }
        return ResponseEntity.status(201).body(uris);
    }

    @GetMapping("/{professorId}/disponibilidade")
    public ResponseEntity<Page<ListagemDisponibilidadeProfessorDto>> listarDisponibilidade(
            @PathVariable("professorId") Long professorId,
            @PageableDefault(size = 10, sort = { "professor.dadosPessoais.nome" }) Pageable paginacao) {
        var page = disponibilidadeProfessorService.listar(paginacao, professorId);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/disponibilidade/{id}")
    public ResponseEntity<ListagemDisponibilidadeProfessorDto> atualizarDisponibilidade(
            @PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoDisponibilidadeProfessorDto dados) {
        var disponibilidadeProfessor = disponibilidadeProfessorService.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemDisponibilidadeProfessorDto(disponibilidadeProfessor));
    }

    @DeleteMapping("/disponibilidade/{id}")
    public ResponseEntity<ListagemDisponibilidadeProfessorDto> excluirDisponibilidade(
            @PathVariable("id") Long id) {
        disponibilidadeProfessorService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
