package br.com.brain.planejamentoAnual;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import br.com.brain.arquivo.dto.ListagemArquivoDto;
import br.com.brain.planejamentoAnual.dto.CadastroPlanejamentoAnualDto;
import br.com.brain.planejamentoAnual.dto.DetalhamentoPlanejamentoAnualDto;
import br.com.brain.planejamentoAnual.dto.ListagemPlanejamentoAnualDto;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("planejamento-anual")
public class PlanejamentoAnualController {

    private final PlanejamentoAnualService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DetalhamentoPlanejamentoAnualDto> cadastrar(
            @RequestPart("dados") CadastroPlanejamentoAnualDto dados,
            @RequestPart("planejamento") MultipartFile planejamento,
            UriComponentsBuilder uriBuilder) {

        var planejamentoAnual = service.cadastrarPlanejamentoAnual(dados, planejamento);
        var uri = uriBuilder.path("/ficha-medica/{id}").buildAndExpand(planejamentoAnual.getId()).toUri();
        return ResponseEntity.created(uri).body(new DetalhamentoPlanejamentoAnualDto(planejamentoAnual));
    }

    @GetMapping("/{ano}")
    public ResponseEntity<ListagemArquivoDto> recuperarPlanejamentoAnual(@PathVariable("ano") Integer ano) {
        var arquivo = service.recuperarPlanejamentoAnual(ano);
        return ResponseEntity.ok(arquivo);
    }

    @GetMapping
    public ResponseEntity<Page<ListagemPlanejamentoAnualDto>> listarPlanejamentoAnual(@PageableDefault Pageable paginacao) {
        var page = service.listarPlanjemento(paginacao);
        return ResponseEntity.ok(page);
    }
}
