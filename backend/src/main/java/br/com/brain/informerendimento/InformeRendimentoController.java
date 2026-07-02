package br.com.brain.informerendimento;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.informerendimento.dto.CadastroInformeRendimentoDto;
import br.com.brain.informerendimento.dto.ListagemInformeRendimentoDto;
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
@RequestMapping("informe-rendimento")
public class InformeRendimentoController {

    private final InformeRendimentoService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListagemInformeRendimentoDto> cadastrar(
            @RequestPart("dados") @Valid CadastroInformeRendimentoDto dados,
            @RequestPart("arquivo") MultipartFile arquivo,
            UriComponentsBuilder uriBuilder) {

        var informe = service.cadastrar(dados, arquivo);
        var uri = uriBuilder.path("/informe-rendimento/{id}").buildAndExpand(informe.getId()).toUri();
        return ResponseEntity.created(uri).body(service.paraDto(informe));
    }

    @GetMapping("/meus")
    public ResponseEntity<List<ListagemInformeRendimentoDto>> meusInformes(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var informes = service.listarPorProfessorLogado(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(informes);
    }
}
