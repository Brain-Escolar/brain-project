package br.com.brain.usuario.gestao;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.SituacaoLogin;
import br.com.brain.enums.PerfilNome;
import br.com.brain.usuario.gestao.dto.FiltroUsuariosDto;
import br.com.brain.usuario.gestao.dto.GrupoFiltroDto;
import br.com.brain.usuario.gestao.dto.UsuarioDetalheDto;
import br.com.brain.usuario.gestao.dto.UsuarioListaDto;

import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tela de Usuários (/usuarios). A URL exige a tela USUARIOS, ou o perfil ADMIN
 * ou DIRETOR, no SecurityConfigurations; cada ação confere o controle dela no
 * serviço (D44). O id é o da pessoa (dados_pessoais), e não o do login.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("usuarios")
public class GestaoUsuariosController {

    private final GestaoUsuariosService service;

    @GetMapping
    public ResponseEntity<Page<UsuarioListaDto>> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) PerfilNome perfil,
            @RequestParam(required = false) Long grupoId,
            @RequestParam(required = false) SituacaoLogin situacao,
            @RequestParam(required = false) Boolean semAcesso,
            @RequestParam(required = false) Boolean comAcessoIndividual,
            @PageableDefault(size = 20, sort = "dadosPessoais.nome", direction = Sort.Direction.ASC) Pageable pageable) {
        var filtro = new FiltroUsuariosDto(busca, perfil, grupoId, situacao, semAcesso, comAcessoIndividual);
        return ResponseEntity.ok(service.listar(filtro, pageable));
    }

    @GetMapping("/grupos")
    public ResponseEntity<List<GrupoFiltroDto>> grupos() {
        return ResponseEntity.ok(service.gruposParaFiltro());
    }

    @GetMapping("/{dadosPessoaisId}")
    public ResponseEntity<UsuarioDetalheDto> detalhar(@PathVariable Long dadosPessoaisId,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.detalhar(dadosPessoaisId, usuario));
    }

    @PostMapping("/{dadosPessoaisId}/login/desativar")
    public ResponseEntity<UsuarioDetalheDto> desativar(@PathVariable Long dadosPessoaisId,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.desativar(dadosPessoaisId, usuario));
    }

    @PostMapping("/{dadosPessoaisId}/login/reativar")
    public ResponseEntity<UsuarioDetalheDto> reativar(@PathVariable Long dadosPessoaisId,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        return ResponseEntity.ok(service.reativar(dadosPessoaisId, usuario));
    }

    @PostMapping("/{dadosPessoaisId}/login/reenviar-verificacao")
    public ResponseEntity<Void> reenviarVerificacao(@PathVariable Long dadosPessoaisId,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.reenviarVerificacao(dadosPessoaisId, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{dadosPessoaisId}/login/redefinir-senha")
    public ResponseEntity<Void> enviarRedefinicao(@PathVariable Long dadosPessoaisId,
            @AuthenticationPrincipal DadosAutenticacao usuario) {
        service.enviarRedefinicao(dadosPessoaisId, usuario);
        return ResponseEntity.noContent().build();
    }
}
