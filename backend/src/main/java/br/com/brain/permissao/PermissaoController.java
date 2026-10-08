package br.com.brain.permissao;

import br.com.brain.enums.PerfilNome;
import br.com.brain.permissao.dto.CatalogoPermissaoDto;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("permissoes")
public class PermissaoController {

    private final CatalogoPermissaoService catalogoService;

    /** Telas e controles que um grupo do perfil pode receber. Restrito a ADMIN e DIRETOR. */
    @GetMapping("/catalogo")
    public ResponseEntity<CatalogoPermissaoDto> catalogo(@RequestParam PerfilNome perfil) {
        return ResponseEntity.ok(catalogoService.catalogo(perfil));
    }
}
