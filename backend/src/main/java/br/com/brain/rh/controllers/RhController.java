// package br.com.brain.rh.controllers;

// import br.com.brain.rh.dtos.AtualizacaoRhDto;
// import br.com.brain.rh.dtos.CadastroRhDto;
// import br.com.brain.rh.dtos.ListagemRhDto;
// import br.com.brain.rh.services.RhService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.web.PageableDefault;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.util.UriComponentsBuilder;

// @RestController
// @RequestMapping("rh")
// @RequiredArgsConstructor
// public class RhController {

//     private final RhService service;

//     @PostMapping
//     public ResponseEntity<ListagemRhDto> cadastrar(
//             @RequestBody @Valid CadastroRhDto dados, UriComponentsBuilder uriBuilder) {
//         var rh = service.cadastrarRh(dados);
//         var uri = uriBuilder.path("/rh/{id}").buildAndExpand(rh.getId()).toUri();
//         return ResponseEntity.created(uri).body(new ListagemRhDto(rh));
//     }

//     @GetMapping
//     public ResponseEntity<Page<ListagemRhDto>> listar(
//             @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
//         var page = service.listar(paginacao);
//         return ResponseEntity.ok(page);
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<ListagemRhDto> atualizar(@PathVariable("id") Long id,
//             @RequestBody @Valid AtualizacaoRhDto dados) {
//         var rh = service.atualizar(dados, id);
//         return ResponseEntity.ok(new ListagemRhDto(rh));
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<ListagemRhDto> excluir(@PathVariable("id") Long id) {
//         service.excluir(id);
//         return ResponseEntity.noContent().build();
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<ListagemRhDto> detalhar(@PathVariable("id") Long id) {
//         var rh = service.detalhar(id);
//         return ResponseEntity.ok(new ListagemRhDto(rh));
//     }
// }
