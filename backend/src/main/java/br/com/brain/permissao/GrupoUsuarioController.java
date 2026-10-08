package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;
import br.com.brain.permissao.dto.AcessosGrupoUsuarioDto;
import br.com.brain.permissao.dto.AdicaoMembrosDto;
import br.com.brain.permissao.dto.AtualizacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.CadastroGrupoUsuarioDto;
import br.com.brain.permissao.dto.DetalhamentoGrupoUsuarioDto;
import br.com.brain.permissao.dto.DuplicacaoGrupoUsuarioDto;
import br.com.brain.permissao.dto.ListagemGrupoUsuarioDto;
import br.com.brain.permissao.dto.PessoaGrupoDto;
import jakarta.validation.Valid;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

/** Tela de grupos de acesso. Restrito a ADMIN e DIRETOR em SecurityConfigurations. */
@RestController
@RequiredArgsConstructor
@RequestMapping("grupos-usuarios")
public class GrupoUsuarioController {

    private final GrupoUsuarioService service;

    @GetMapping
    public ResponseEntity<List<ListagemGrupoUsuarioDto>> listar(@RequestParam(required = false) PerfilNome perfil) {
        return ResponseEntity.ok(service.listar(perfil));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoGrupoUsuarioDto> detalhar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping
    public ResponseEntity<DetalhamentoGrupoUsuarioDto> cadastrar(@RequestBody @Valid CadastroGrupoUsuarioDto dados,
            UriComponentsBuilder uriBuilder) {
        var grupo = service.cadastrar(dados);
        var uri = uriBuilder.path("/grupos-usuarios/{id}").buildAndExpand(grupo.id()).toUri();
        return ResponseEntity.created(uri).body(grupo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoGrupoUsuarioDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoGrupoUsuarioDto dados) {
        return ResponseEntity.ok(service.atualizar(id, dados));
    }

    @PutMapping("/{id}/acessos")
    public ResponseEntity<DetalhamentoGrupoUsuarioDto> salvarAcessos(@PathVariable("id") Long id,
            @RequestBody @Valid AcessosGrupoUsuarioDto dados) {
        return ResponseEntity.ok(service.salvarAcessos(id, dados));
    }

    @PostMapping("/{id}/duplicar")
    public ResponseEntity<DetalhamentoGrupoUsuarioDto> duplicar(@PathVariable("id") Long id,
            @RequestBody @Valid DuplicacaoGrupoUsuarioDto dados, UriComponentsBuilder uriBuilder) {
        var copia = service.duplicar(id, dados);
        var uri = uriBuilder.path("/grupos-usuarios/{id}").buildAndExpand(copia.id()).toUri();
        return ResponseEntity.created(uri).body(copia);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/membros")
    public ResponseEntity<Page<PessoaGrupoDto>> membros(@PathVariable("id") Long id,
            @RequestParam(defaultValue = "") String busca, @PageableDefault(size = 20) Pageable paginacao) {
        return ResponseEntity.ok(service.buscarMembros(id, busca, paginacao));
    }

    @GetMapping("/{id}/candidatos")
    public ResponseEntity<Page<PessoaGrupoDto>> candidatos(@PathVariable("id") Long id,
            @RequestParam(defaultValue = "") String busca, @PageableDefault(size = 20) Pageable paginacao) {
        return ResponseEntity.ok(service.buscarCandidatos(id, busca, paginacao));
    }

    @PostMapping("/{id}/membros")
    public ResponseEntity<Void> adicionarMembros(@PathVariable("id") Long id,
            @RequestBody @Valid AdicaoMembrosDto dados) {
        service.adicionarMembros(id, dados);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/membros/{dadosPessoaisId}")
    public ResponseEntity<Void> removerMembro(@PathVariable("id") Long id,
            @PathVariable("dadosPessoaisId") Long dadosPessoaisId) {
        service.removerMembro(id, dadosPessoaisId);
        return ResponseEntity.noContent().build();
    }
}
