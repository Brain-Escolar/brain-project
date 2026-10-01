package br.com.brain.documentoEscolar;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.documentoEscolar.dto.BoletimDto;
import br.com.brain.documentoEscolar.dto.HistoricoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Documentos escolares emitidos pela secretaria (boletim e histórico). */
@RestController
@RequestMapping("documentos-escolares")
@RequiredArgsConstructor
public class DocumentoEscolarController {

    private final DocumentoEscolarService service;

    /**
     * Boletim do aluno. Sem {@code anoLetivo}, usa o ano em curso (ou o último
     * cursado); sem {@code periodoAte}, vai até o último período já iniciado.
     */
    @GetMapping("/aluno/{alunoId}/boletim")
    public ResponseEntity<BoletimDto> boletim(
            @PathVariable Long alunoId,
            @RequestParam(required = false) Integer anoLetivo,
            @RequestParam(required = false) Integer periodoAte,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.gerarBoletim(alunoId, anoLetivo, periodoAte, usuario.getDadosPessoais()));
    }

    @GetMapping("/aluno/{alunoId}/historico")
    public ResponseEntity<HistoricoDto> historico(
            @PathVariable Long alunoId,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.gerarHistorico(alunoId, usuario.getDadosPessoais()));
    }
}
