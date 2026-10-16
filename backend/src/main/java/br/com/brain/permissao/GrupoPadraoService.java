package br.com.brain.permissao;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.PerfilNome;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * D2: quem recebe um perfil entra no grupo padrão daquele perfil.
 *
 * Chamado nos dois pontos que concedem perfil hoje: UsuarioService.cadastrarUsuario
 * e ResponsavelService.garantirAcessoAoPortal. Quem já existia antes desta regra e
 * ficou fora de qualquer grupo é vinculado à mão, pela tela de grupos.
 */
@Service
@RequiredArgsConstructor
public class GrupoPadraoService {

    private final GrupoUsuarioRepository grupoRepository;
    private final GrupoUsuarioMembroRepository membroRepository;

    @Transactional
    public void vincular(DadosPessoais pessoa, PerfilNome perfil) {
        // O ADMIN não tem grupo: recebe o teto do perfil direto.
        if (perfil == PerfilNome.ADMIN || pessoa == null || pessoa.getId() == null) {
            return;
        }
        grupoRepository.findPadraoDoPerfil(perfil).ifPresent(grupo -> {
            var jaEstaNoGrupo = membroRepository
                    .findByGrupoUsuarioIdAndDadosPessoaisId(grupo.getId(), pessoa.getId())
                    .isPresent();
            if (!jaEstaNoGrupo) {
                membroRepository.save(new GrupoUsuarioMembro(grupo, pessoa));
            }
        });
    }
}
