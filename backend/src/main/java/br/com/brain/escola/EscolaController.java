package br.com.brain.escola;

import br.com.brain.escola.dto.CadastroEscolaDto;
import br.com.brain.escola.dto.CadastroPrimeiroAdminDto;
import br.com.brain.escola.dto.DetalhamentoEscolaDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/escola")
public class EscolaController {

    private final EscolaService escolaService;

    @PostMapping
    public ResponseEntity<DetalhamentoEscolaDto> cadastrar(@RequestBody @Valid CadastroEscolaDto dto) {
        return ResponseEntity.ok(escolaService.cadastrar(dto));
    }

    @GetMapping
    public ResponseEntity<List<DetalhamentoEscolaDto>> listar() {
        return ResponseEntity.ok(escolaService.listar());
    }

    @PostMapping("/{codigoEscola}/primeiro-admin")
    public ResponseEntity<Void> cadastrarPrimeiroAdmin(
            @PathVariable String codigoEscola,
            @RequestBody @Valid CadastroPrimeiroAdminDto dto) {
        escolaService.cadastrarPrimeiroAdmin(codigoEscola, dto);
        return ResponseEntity.ok().build();
    }
}
