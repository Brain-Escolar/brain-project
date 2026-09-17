package br.com.brain.secretario;

import br.com.brain.enums.PerfilNome;
import br.com.brain.secretario.dto.AtualizacaoSecretarioDto;
import br.com.brain.secretario.dto.CadastroSecretarioDto;
import br.com.brain.secretario.dto.ListagemSecretarioDto;
import br.com.brain.usuario.UsuarioService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("secretario")
@RequiredArgsConstructor
public class SecretarioController {

    private final SecretarioService service;
    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<ListagemSecretarioDto> cadastrar(
            @RequestBody @Valid CadastroSecretarioDto dados, UriComponentsBuilder uriBuilder) {
        var secretario = service.cadastrarSecretario(dados);
        usuarioService.cadastrarUsuario(secretario.getDadosPessoais(), PerfilNome.SECRETARIO, dados.cpf());
        var uri = uriBuilder.path("/secretario/{id}").buildAndExpand(secretario.getId()).toUri();
        return ResponseEntity.created(uri).body(new ListagemSecretarioDto(secretario));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemSecretarioDto>> listar(
            @PageableDefault(size = 10, sort = { "dadosPessoais.nome" }) Pageable paginacao) {
        return ResponseEntity.ok(service.listar(paginacao));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListagemSecretarioDto> atualizar(@PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoSecretarioDto dados) {
        var secretario = service.atualizar(dados, id);
        return ResponseEntity.ok(new ListagemSecretarioDto(secretario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListagemSecretarioDto> detalhar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(new ListagemSecretarioDto(service.detalhar(id)));
    }
}
