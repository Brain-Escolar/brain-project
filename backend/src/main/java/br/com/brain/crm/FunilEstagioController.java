package br.com.brain.crm;

import br.com.brain.crm.dto.AtualizacaoFunilEstagioDto;
import br.com.brain.crm.dto.CadastroFunilEstagioDto;
import br.com.brain.crm.dto.FunilEstagioDto;
import br.com.brain.crm.dto.MoverFunilEstagioDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("crm/estagios")
public class FunilEstagioController {

    private final FunilEstagioService service;

    @GetMapping
    public ResponseEntity<List<FunilEstagioDto>> listar() {
        return ResponseEntity.ok(service.listar().stream().map(FunilEstagioDto::new).toList());
    }

    @PostMapping
    public ResponseEntity<FunilEstagioDto> cadastrar(
            @RequestBody @Valid CadastroFunilEstagioDto dados,
            UriComponentsBuilder uriBuilder) {
        var estagio = service.cadastrar(dados);
        var uri = uriBuilder.path("/crm/estagios/{id}").buildAndExpand(estagio.getId()).toUri();
        return ResponseEntity.created(uri).body(new FunilEstagioDto(estagio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FunilEstagioDto> atualizar(
            @PathVariable("id") Long id,
            @RequestBody AtualizacaoFunilEstagioDto dados) {
        return ResponseEntity.ok(new FunilEstagioDto(service.atualizar(id, dados)));
    }

    @PostMapping("/{id}/mover")
    public ResponseEntity<Void> mover(@PathVariable("id") Long id, @RequestBody MoverFunilEstagioDto direcao) {
        service.mover(id, direcao);
        return ResponseEntity.noContent().build();
    }
}
