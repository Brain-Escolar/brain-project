package br.com.brain.crm;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.crm.dto.CadastroInteracaoDto;
import br.com.brain.crm.dto.CadastroLeadCrmDto;
import br.com.brain.crm.dto.DetalhamentoProcessoCrmDto;
import br.com.brain.crm.dto.ListagemProcessoCrmDto;
import br.com.brain.crm.dto.MarcarPerdidoDto;
import br.com.brain.crm.dto.ReatribuirProcessoDto;
import br.com.brain.enums.StatusProcessoMatricula;
import br.com.brain.enums.TipoProcessoMatricula;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("crm/processos")
public class ProcessoMatriculaController {

    private final ProcessoMatriculaService service;

    @GetMapping
    public ResponseEntity<List<ListagemProcessoCrmDto>> listar(
            @RequestParam(required = false) StatusProcessoMatricula status,
            @RequestParam(required = false) Long funcionarioId,
            @RequestParam(required = false) Boolean semDono,
            @RequestParam(required = false) TipoProcessoMatricula tipo) {
        return ResponseEntity.ok(service.listar(status, funcionarioId, semDono, tipo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoProcessoCrmDto> detalhar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping
    public ResponseEntity<DetalhamentoProcessoCrmDto> cadastrar(
            @RequestBody @Valid CadastroLeadCrmDto dados,
            UriComponentsBuilder uriBuilder) {
        var processo = service.criarLead(dados);
        var uri = uriBuilder.path("/crm/processos/{id}").buildAndExpand(processo.getId()).toUri();
        return ResponseEntity.created(uri).body(service.detalhar(processo.getId()));
    }

    @PostMapping("/{id}/interacoes")
    public ResponseEntity<DetalhamentoProcessoCrmDto> registrarInteracao(
            @PathVariable("id") Long id,
            @RequestBody @Valid CadastroInteracaoDto dados,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.registrarInteracao(id, dados, usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping("/{id}/avancar-estagio")
    public ResponseEntity<DetalhamentoProcessoCrmDto> avancarEstagio(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.avancarEstagio(id, usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping("/{id}/perder")
    public ResponseEntity<DetalhamentoProcessoCrmDto> marcarPerdido(
            @PathVariable("id") Long id,
            @RequestBody @Valid MarcarPerdidoDto dados) {
        service.marcarPerdido(id, dados.motivo());
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping("/{id}/desistir")
    public ResponseEntity<DetalhamentoProcessoCrmDto> marcarDesistiu(
            @PathVariable("id") Long id,
            @RequestBody @Valid MarcarPerdidoDto dados) {
        service.marcarDesistiu(id, dados.motivo());
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping("/{id}/reatribuir")
    public ResponseEntity<DetalhamentoProcessoCrmDto> reatribuir(
            @PathVariable("id") Long id,
            @RequestBody @Valid ReatribuirProcessoDto dados) {
        service.reatribuir(id, dados.funcionarioId());
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping("/{id}/atribuir-a-mim")
    public ResponseEntity<DetalhamentoProcessoCrmDto> atribuirAMim(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.reatribuir(id, usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping("/distribuir")
    public ResponseEntity<Void> distribuir() {
        service.distribuirFila();
        return ResponseEntity.noContent().build();
    }
}
