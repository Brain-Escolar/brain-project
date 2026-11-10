package br.com.brain.permissao;

import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.enums.PerfilNome;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * D2: quem recebe um perfil entra no grupo padrão daquele perfil.
 *
 * Os perfis são concedidos no UsuarioService: cadastrarUsuario, no login novo, e
 * concederPerfil, em quem já tem login. Quem já existia antes desta regra e ficou
 * fora de qualquer grupo é vinculado à mão, pela tela de grupos.
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
        // Quem perdeu o perfil e o recebeu de volta continua nos grupos que tinha. Se
        // foi posto num grupo menor para restringir, entrar no padrão desfaria a
        // restrição, porque os grupos somam (RP2, D41).
        if (membroRepository.estaEmGrupoNormalDoPerfil(pessoa.getId(), perfil)) {
            return;
        }
        grupoRepository.findPadraoDoPerfil(perfil)
                .ifPresent(grupo -> membroRepository.save(new GrupoUsuarioMembro(grupo, pessoa)));
    }
}
