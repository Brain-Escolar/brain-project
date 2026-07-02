package br.com.brain.holerite;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.holerite.dto.CadastroHoleriteDto;
import br.com.brain.holerite.dto.ListagemHoleriteDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("holerite")
public class HoleriteController {

    private final HoleriteService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListagemHoleriteDto> cadastrar(
            @RequestPart("dados") @Valid CadastroHoleriteDto dados,
            @RequestPart("arquivo") MultipartFile arquivo,
            UriComponentsBuilder uriBuilder) {

        var holerite = service.cadastrar(dados, arquivo);
        var uri = uriBuilder.path("/holerite/{id}").buildAndExpand(holerite.getId()).toUri();
        return ResponseEntity.created(uri).body(service.paraDto(holerite));
    }

    @GetMapping("/meus")
    public ResponseEntity<List<ListagemHoleriteDto>> meusHolerites(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var holerites = service.listarPorProfessorLogado(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(holerites);
    }
}
