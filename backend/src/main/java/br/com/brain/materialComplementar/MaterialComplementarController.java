package br.com.brain.materialComplementar;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.materialComplementar.dto.CadastroMaterialComplementarDto;
import br.com.brain.materialComplementar.dto.ListagemMaterialComplementarDto;
import br.com.brain.professor.ProfessorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("material-complementar")
public class MaterialComplementarController {

    private final MaterialComplementarService service;
    private final ProfessorService professorService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ListagemMaterialComplementarDto> cadastrar(
            @RequestPart("dados") @Valid CadastroMaterialComplementarDto dados,
            @RequestPart(value = "arquivo", required = false) MultipartFile arquivo,
            UriComponentsBuilder uriBuilder,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        var material = service.cadastrar(dados, arquivo, professor);
        var uri = uriBuilder.path("/material-complementar/{id}").buildAndExpand(material.getId()).toUri();
        return ResponseEntity.created(uri).body(service.paraDto(material));
    }

    @GetMapping("/professor")
    public ResponseEntity<List<ListagemMaterialComplementarDto>> listarPorProfessor(
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        return ResponseEntity.ok(service.listarPorProfessor(professor.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id, @AuthenticationPrincipal DadosAutenticacao usuario) {
        var professor = professorService.recuperarProfessorPorDadosPessoais(usuario.getDadosPessoais().getId());
        service.excluir(id, professor.getId());
        return ResponseEntity.noContent().build();
    }
}
