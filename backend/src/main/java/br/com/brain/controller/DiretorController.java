// package br.com.brain.controller;

// import br.com.brain.dto.diretor.AtualizacaoDiretorDto;
// import br.com.brain.dto.diretor.CadastroDiretorDto;
// import br.com.brain.dto.diretor.ListagemDiretorDto;
// import br.com.brain.service.DiretorService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.web.PageableDefault;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.util.UriComponentsBuilder;

// @RestController
// @RequestMapping("diretor")
// @RequiredArgsConstructor
// public class DiretorController {

//     private final DiretorService service;

//     @PostMapping
//     public ResponseEntity<ListagemDiretorDto> cadastrar(
//             @RequestBody @Valid CadastroDiretorDto dados, UriComponentsBuilder uriBuilder) {
//         var diretor = service.cadastrarDiretor(dados);
//         var uri = uriBuilder.path("/diretor/{id}").buildAndExpand(diretor.getId()).toUri();
//         return ResponseEntity.created(uri).body(new ListagemDiretorDto(diretor));
//     }

//     @GetMapping
//     public ResponseEntity<Page<ListagemDiretorDto>> listar(
//             @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
//         var page = service.listar(paginacao);
//         return ResponseEntity.ok(page);
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<ListagemDiretorDto> atualizar(@PathVariable("id") Long id,
//             @RequestBody @Valid AtualizacaoDiretorDto dados) {
//         var diretor = service.atualizar(dados, id);
//         return ResponseEntity.ok(new ListagemDiretorDto(diretor));
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<ListagemDiretorDto> excluir(@PathVariable("id") Long id) {
//         service.excluir(id);
//         return ResponseEntity.noContent().build();
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<ListagemDiretorDto> detalhar(@PathVariable("id") Long id) {
//         var diretor = service.detalhar(id);
//         return ResponseEntity.ok(new ListagemDiretorDto(diretor));
//     }
// }
