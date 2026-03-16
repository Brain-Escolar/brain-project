// package br.com.brain.controller;

// import br.com.brain.dto.coordenador.AtualizacaoCoordenadorDto;
// import br.com.brain.dto.coordenador.CadastroCoordenadorDto;
// import br.com.brain.dto.coordenador.ListagemCoordenadorDto;
// import br.com.brain.service.CoordenadorService;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.data.web.PageableDefault;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.util.UriComponentsBuilder;

// @RestController
// @RequestMapping("coordenador")
// @RequiredArgsConstructor
// public class CoordenadorController {

//     private final CoordenadorService service;

//     @PostMapping
//     public ResponseEntity<ListagemCoordenadorDto> cadastrar(
//             @RequestBody @Valid CadastroCoordenadorDto dados, UriComponentsBuilder uriBuilder) {
//         var coordenador = service.cadastrarCoordenador(dados);
//         var uri = uriBuilder.path("/coordenador/{id}").buildAndExpand(coordenador.getId()).toUri();
//         return ResponseEntity.created(uri).body(new ListagemCoordenadorDto(coordenador));
//     }

//     @GetMapping
//     public ResponseEntity<Page<ListagemCoordenadorDto>> listar(
//             @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
//         var page = service.listar(paginacao);
//         return ResponseEntity.ok(page);
//     }

//     @PutMapping("/{id}")
//     public ResponseEntity<ListagemCoordenadorDto> atualizar(@PathVariable("id") Long id,
//             @RequestBody @Valid AtualizacaoCoordenadorDto dados) {
//         var coordenador = service.atualizar(dados, id);
//         return ResponseEntity.ok(new ListagemCoordenadorDto(coordenador));
//     }

//     @DeleteMapping("/{id}")
//     public ResponseEntity<ListagemCoordenadorDto> excluir(@PathVariable("id") Long id) {
//         service.excluir(id);
//         return ResponseEntity.noContent().build();
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<ListagemCoordenadorDto> detalhar(@PathVariable("id") Long id) {
//         var coordenador = service.detalhar(id);
//         return ResponseEntity.ok(new ListagemCoordenadorDto(coordenador));
//     }
// }
