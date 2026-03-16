// package br.com.brain.controller;

// import br.com.brain.dto.orientador.AtualizacaoOrientadorDto;
// import br.com.brain.dto.orientador.CadastroOrientadorDto;
// import br.com.brain.dto.orientador.ListagemOrientadorDto;
// import br.com.brain.service.OrientadorService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.web.PageableDefault;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.util.UriComponentsBuilder;

// @RestController
// @RequestMapping("orientador")
// @RequiredArgsConstructor
// public class OrientadorController {

//     private final OrientadorService service;

//     @PostMapping
//     public ResponseEntity<ListagemOrientadorDto> cadastrar(
//             @RequestBody @Valid CadastroOrientadorDto dados, UriComponentsBuilder uriBuilder) {
//         var orientador = service.cadastrarOrientador(dados);
//         var uri = uriBuilder.path("/orientador/{id}").buildAndExpand(orientador.getId()).toUri();
//         return ResponseEntity.created(uri).body(new ListagemOrientadorDto(orientador));
//     }

//     @GetMapping
//     public ResponseEntity<Page<ListagemOrientadorDto>> listar(
//             @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
//         var page = service.listar(paginacao);
//         return ResponseEntity.ok(page);
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<ListagemOrientadorDto> atualizar(@PathVariable("id") Long id,
//             @RequestBody @Valid AtualizacaoOrientadorDto dados) {
//         var orientador = service.atualizar(dados, id);
//         return ResponseEntity.ok(new ListagemOrientadorDto(orientador));
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<ListagemOrientadorDto> excluir(@PathVariable("id") Long id) {
//         service.excluir(id);
//         return ResponseEntity.noContent().build();
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<ListagemOrientadorDto> detalhar(@PathVariable("id") Long id) {
//         var orientador = service.detalhar(id);
//         return ResponseEntity.ok(new ListagemOrientadorDto(orientador));
//     }
// }
