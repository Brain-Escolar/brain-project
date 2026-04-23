// package br.com.brain.secretario.controllers;

// import br.com.brain.secretario.dtos.AtualizacaoSecretarioDto;
// import br.com.brain.secretario.dtos.CadastroSecretarioDto;
// import br.com.brain.secretario.dtos.ListagemSecretarioDto;
// import br.com.brain.secretario.services.SecretarioService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.web.PageableDefault;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.util.UriComponentsBuilder;

// @RestController
// @RequestMapping("secretario")
// @RequiredArgsConstructor
// public class SecretarioController {

//     private final SecretarioService service;

//     @PostMapping
//     public ResponseEntity<ListagemSecretarioDto> cadastrar(
//             @RequestBody @Valid CadastroSecretarioDto dados, UriComponentsBuilder uriBuilder) {
//         var secretario = service.cadastrarSecretario(dados);
//         var uri = uriBuilder.path("/secretario/{id}").buildAndExpand(secretario.getId()).toUri();
//         return ResponseEntity.created(uri).body(new ListagemSecretarioDto(secretario));
//     }

//     @GetMapping
//     public ResponseEntity<Page<ListagemSecretarioDto>> listar(
//             @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
//         var page = service.listar(paginacao);
//         return ResponseEntity.ok(page);
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<ListagemSecretarioDto> atualizar(@PathVariable("id") Long id,
//             @RequestBody @Valid AtualizacaoSecretarioDto dados) {
//         var secretario = service.atualizar(dados, id);
//         return ResponseEntity.ok(new ListagemSecretarioDto(secretario));
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<ListagemSecretarioDto> excluir(@PathVariable("id") Long id) {
//         service.excluir(id);
//         return ResponseEntity.noContent().build();
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<ListagemSecretarioDto> detalhar(@PathVariable("id") Long id) {
//         var secretario = service.detalhar(id);
//         return ResponseEntity.ok(new ListagemSecretarioDto(secretario));
//     }
// }
