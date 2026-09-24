package br.com.brain.documento;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.documento.dto.AprovacaoDocumentoDto;
import br.com.brain.documento.dto.DetalhamentoDocumentoDto;
import br.com.brain.documento.dto.DocumentacaoAlunoDto;
import br.com.brain.documento.dto.FotoDto;
import br.com.brain.documento.dto.ListagemDocumentoFilaDto;
import br.com.brain.documento.dto.RejeicaoDocumentoDto;
import br.com.brain.enums.StatusDocumento;
import br.com.brain.enums.TipoDocumento;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Documentos de matricula - visao da escola (envio, fila de validacao,
 * aprovacao/rejeicao). O envio pela familia fica em /portal-responsavel.
 */
@RestController
@RequestMapping("documentos")
@RequiredArgsConstructor
public class DocumentoController {

    private final DocumentoService service;

    /** Checklist do aluno e de todos os responsaveis. */
    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<DocumentacaoAlunoDto> documentacaoDoAluno(@PathVariable("alunoId") Long alunoId) {
        return ResponseEntity.ok(service.documentacaoDoAluno(alunoId));
    }

    /** Fila de validacao. Sem status, lista os EM_ANALISE, mais antigos primeiro. */
    @GetMapping
    public ResponseEntity<Page<ListagemDocumentoFilaDto>> fila(
            @RequestParam(required = false) StatusDocumento status,
            @PageableDefault(size = 20, sort = { "enviadoEm" }) Pageable paginacao) {
        return ResponseEntity.ok(service.fila(status, paginacao));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalhamentoDocumentoDto> detalhar(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.detalhar(id));
    }

    @PostMapping(value = "/pessoa/{dadosPessoaisId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DetalhamentoDocumentoDto> enviar(
            @PathVariable("dadosPessoaisId") Long dadosPessoaisId,
            @RequestParam("tipo") TipoDocumento tipo,
            @RequestPart("arquivos") List<MultipartFile> arquivos) {
        return ResponseEntity.ok(service.enviar(dadosPessoaisId, tipo, arquivos));
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<DetalhamentoDocumentoDto> aprovar(
            @PathVariable("id") Long id,
            @RequestBody(required = false) @Valid AprovacaoDocumentoDto dados,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        var dataValidade = dados == null ? null : dados.dataValidade();
        return ResponseEntity.ok(service.aprovar(id, usuario.getDadosPessoais().getId(), dataValidade));
    }

    @PostMapping("/{id}/rejeitar")
    public ResponseEntity<DetalhamentoDocumentoDto> rejeitar(
            @PathVariable("id") Long id,
            @RequestBody @Valid RejeicaoDocumentoDto dados,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.rejeitar(id, usuario.getDadosPessoais().getId(), dados.motivo()));
    }

    @PutMapping(value = "/pessoa/{dadosPessoaisId}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FotoDto> atualizarFoto(
            @PathVariable("dadosPessoaisId") Long dadosPessoaisId,
            @RequestPart("foto") MultipartFile foto) {
        return ResponseEntity.ok(service.atualizarFoto(dadosPessoaisId, foto));
    }
}
