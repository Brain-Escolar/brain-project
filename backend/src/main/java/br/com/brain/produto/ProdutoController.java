package br.com.brain.produto;

import java.util.List;

import br.com.brain.produto.dto.AtualizacaoProdutoDto;
import br.com.brain.produto.dto.AtualizacaoProdutoModalidadeDto;
import br.com.brain.produto.dto.CadastroAlunoProdutoDto;
import br.com.brain.produto.dto.CadastroProdutoDto;
import br.com.brain.produto.dto.CadastroProdutoModalidadeDto;
import br.com.brain.produto.dto.CadastroProdutoPrecoDto;
import br.com.brain.produto.dto.DecisaoPrecoRequest;
import br.com.brain.produto.dto.DetalhamentoProdutoDto;
import br.com.brain.produto.dto.ListagemAlunoProdutoDto;
import br.com.brain.produto.dto.ListagemProdutoDto;
import br.com.brain.produto.dto.ListagemProdutoModalidadeDto;
import br.com.brain.produto.dto.ListagemProdutoPrecoDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequiredArgsConstructor
@RequestMapping("produto")
public class ProdutoController {

    private final ProdutoService service;
    private final AlunoProdutoService alunoProdutoService;
    private final ProdutoPrecoService precoService;

    @PostMapping
    public ResponseEntity<DetalhamentoProdutoDto> cadastrar(
            @RequestBody @Valid CadastroProdutoDto dados,
            UriComponentsBuilder uriBuilder) {
        var produto = service.cadastrar(dados);
        var uri = uriBuilder.path("/produto/{id}").buildAndExpand(produto.getId()).toUri();
        return ResponseEntity.created(uri).body(service.detalhar(produto.getId()));
    }

    @GetMapping
    public ResponseEntity<Page<ListagemProdutoDto>> listar(
            @PageableDefault(size = 10, sort = { "nome" }) Pageable paginacao) {
        return ResponseEntity.ok(service.listar(paginacao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoProdutoDto> detalhar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalhamentoProdutoDto> atualizar(
            @PathVariable("id") Long id,
            @RequestBody @Valid AtualizacaoProdutoDto dados) {
        service.atualizar(id, dados);
        return ResponseEntity.ok(service.detalhar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable("id") Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{produtoId}/modalidades")
    public ResponseEntity<ListagemProdutoModalidadeDto> adicionarModalidade(
            @PathVariable Long produtoId,
            @RequestBody @Valid CadastroProdutoModalidadeDto dados) {
        var modalidade = service.adicionarModalidade(produtoId, dados);
        return ResponseEntity.ok(new ListagemProdutoModalidadeDto(modalidade));
    }

    @GetMapping("/{produtoId}/modalidades")
    public ResponseEntity<List<ListagemProdutoModalidadeDto>> listarModalidades(@PathVariable Long produtoId) {
        return ResponseEntity.ok(service.listarModalidades(produtoId));
    }

    @PutMapping("/modalidades/{modalidadeId}")
    public ResponseEntity<ListagemProdutoModalidadeDto> atualizarModalidade(
            @PathVariable Long modalidadeId,
            @RequestBody @Valid AtualizacaoProdutoModalidadeDto dados) {
        var modalidade = service.atualizarModalidade(modalidadeId, dados);
        return ResponseEntity.ok(new ListagemProdutoModalidadeDto(modalidade));
    }

    @DeleteMapping("/modalidades/{modalidadeId}")
    public ResponseEntity<Void> excluirModalidade(@PathVariable Long modalidadeId) {
        service.excluirModalidade(modalidadeId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/modalidades/{modalidadeId}/alunos")
    public ResponseEntity<ListagemAlunoProdutoDto> registrarCompra(
            @PathVariable Long modalidadeId,
            @RequestBody @Valid CadastroAlunoProdutoDto dados) {
        var compra = alunoProdutoService.comprar(modalidadeId, dados);
        return ResponseEntity.ok(new ListagemAlunoProdutoDto(compra));
    }

    @GetMapping("/modalidades/{modalidadeId}/alunos")
    public ResponseEntity<List<ListagemAlunoProdutoDto>> listarCompradores(@PathVariable Long modalidadeId) {
        return ResponseEntity.ok(alunoProdutoService.listarPorModalidade(modalidadeId));
    }

    @GetMapping("/alunos/{alunoId}")
    public ResponseEntity<List<ListagemAlunoProdutoDto>> listarComprasPorAluno(@PathVariable Long alunoId) {
        return ResponseEntity.ok(alunoProdutoService.listarPorAluno(alunoId));
    }

    @DeleteMapping("/alunos/compras/{compraId}")
    public ResponseEntity<Void> cancelarCompra(@PathVariable Long compraId) {
        alunoProdutoService.cancelar(compraId);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------------ precos
    //
    // A tabela de precos e o comeco da cadeia: sem preco nao ha proposta, sem
    // proposta nao ha contrato, sem contrato nao ha carne. Ate agora isso so
    // existia por SQL na mao.
    //
    // Nao ha PUT de valor de proposito. Reajuste e POST com `encerrarAnterior`:
    // a linha antiga ganha fim e a nova entra. Ver ProdutoPrecoService.

    @GetMapping("/modalidades/{modalidadeId}/precos")
    public ResponseEntity<List<ListagemProdutoPrecoDto>> listarPrecos(@PathVariable Long modalidadeId) {
        return ResponseEntity.ok(precoService.listar(modalidadeId));
    }

    @PostMapping("/modalidades/{modalidadeId}/precos")
    public ResponseEntity<ListagemProdutoPrecoDto> cadastrarPreco(
            @PathVariable Long modalidadeId,
            @RequestBody @Valid CadastroProdutoPrecoDto dados) {
        return ResponseEntity.ok(precoService.cadastrar(modalidadeId, dados));
    }

    /**
     * A fila de quem aprova preço.
     *
     * Antes de /precos/{precoId} de propósito: "pendentes" casaria como id e
     * viraria NumberFormatException.
     */
    @GetMapping("/precos/pendentes")
    public ResponseEntity<List<ListagemProdutoPrecoDto>> precosPendentes() {
        return ResponseEntity.ok(precoService.pendentesDeAprovacao());
    }

    /**
     * Aprova o reajuste: é aqui que o preço novo passa a valer e o anterior é
     * encerrado. A sobreposição é reconferida neste instante.
     */
    @PutMapping("/precos/{precoId}/aprovacao")
    public ResponseEntity<ListagemProdutoPrecoDto> aprovarPreco(
            @PathVariable Long precoId,
            @RequestBody(required = false) DecisaoPrecoRequest decisao) {
        return ResponseEntity.ok(precoService.aprovar(precoId, decisao));
    }

    /** Recusa o reajuste. O motivo é obrigatório. */
    @PutMapping("/precos/{precoId}/rejeicao")
    public ResponseEntity<ListagemProdutoPrecoDto> rejeitarPreco(
            @PathVariable Long precoId,
            @RequestBody DecisaoPrecoRequest decisao) {
        return ResponseEntity.ok(precoService.rejeitar(precoId, decisao));
    }

    /** Fecha a vigência de um preço. É a única alteração possível numa linha existente. */
    @PutMapping("/precos/{precoId}/encerramento")
    public ResponseEntity<ListagemProdutoPrecoDto> encerrarPreco(
            @PathVariable Long precoId,
            @RequestParam("dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return ResponseEntity.ok(precoService.encerrar(precoId, dataFim));
    }

    /** Só para preço que ainda não entrou em vigor — erro de digitação antes de valer. */
    @DeleteMapping("/precos/{precoId}")
    public ResponseEntity<Void> excluirPreco(@PathVariable Long precoId) {
        precoService.excluir(precoId);
        return ResponseEntity.noContent().build();
    }
}
