package br.com.brain.permissao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.enums.PerfilNome;
import br.com.brain.permissao.dto.CatalogoPermissaoDto;
import br.com.brain.permissao.dto.PermissoesUsuarioDto;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("permissoes")
public class PermissaoController {

    private final CatalogoPermissaoService catalogoService;
    private final PermissoesUsuarioService permissoesUsuarioService;

    /**
     * Telas e controles de quem está logado, por perfil. O frontend chama no
     * login e ao recarregar a página, e guarda em cache (docs/permissoes.md, 9.1).
     */
    @GetMapping("/me")
    public ResponseEntity<PermissoesUsuarioDto> minhas(@AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(permissoesUsuarioService.doUsuario(usuario));
    }

    /**
     * Telas e controles que um grupo do perfil pode receber (o teto). Com
     * individual=true, o catálogo inteiro, para o acesso individual de uma
     * pessoa no perfil (D22). Restrito a ADMIN e DIRETOR.
     */
    @GetMapping("/catalogo")
    public ResponseEntity<CatalogoPermissaoDto> catalogo(@RequestParam PerfilNome perfil,
            @RequestParam(defaultValue = "false") boolean individual) {
        return ResponseEntity.ok(individual ? catalogoService.catalogoIndividual(perfil) : catalogoService.catalogo(perfil));
    }
}
