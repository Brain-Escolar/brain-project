package br.com.brain.service;

import br.com.brain.domain.autenticacao.DadosAutenticacao;
import br.com.brain.domain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.perfil.PerfilRepository;
import br.com.brain.dto.usuario.AlteracaoSenhaDto;
import br.com.brain.dto.usuario.ListagemUsuarioDto;
import br.com.brain.dto.usuario.RedefinicaoSenhaDto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.email.EmailService;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.utils.Utils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final PerfilRepository perfilRepository;
    private final DadosAutenticacaoRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Long cadastrarUsuario(DadosPessoais dadosPessoais, PerfilNome nomePerfil, String senha) {
        var senhaCriptografada = passwordEncoder.encode(senha);

        var perfil = perfilRepository.findByNome(nomePerfil);
        var usuario = new DadosAutenticacao(dadosPessoais.getPerfis(), dadosPessoais.getEmailProfissional(),
                senhaCriptografada, perfil);

        usuario.setDadosPessoais(dadosPessoais);
        var usuarioCriado = usuarioRepository.save(usuario);
        String schema = TenantContext.getTenantId();
        emailService.enviarEmailVerificacao(dadosPessoais.getNomeSocial(), dadosPessoais.getEmail(), senha, usuario, schema);
        return usuarioCriado.getId();
    }

    public Page<ListagemUsuarioDto> listar(Pageable paginacao) {
        return usuarioRepository.findAll(paginacao).map(ListagemUsuarioDto::new);
    }

    @Transactional
    public void excluir(Long id) {
        var usuario = usuarioRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario de id " + id + " não existe."));
        usuarioRepository.delete(usuario);
    }

    public DadosAutenticacao recuperarUsuarioPorId(Long id) {
        return usuarioRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario de id " + id + " não existe."));
    }

    public DadosAutenticacao recuperarUsuarioLogado(DadosAutenticacao usuario) {
        if (usuario == null) {
            throw new ErrosSistema.SessaoExpiradaException(
                    "Sua sessão foi expirada! Por favor, faça o login novamente");
        }
        return usuarioRepository
                .findById(usuario.getId())
                .orElseThrow(() -> new EntityNotFoundException("Usuario de id " + usuario.getId() + " não existe."));
    }

    @Transactional
    public void verificarEmail(String codigo) {
        var usuario = usuarioRepository.findByToken(codigo)
                .orElseThrow(() -> new ErrosSistema.RecursoNaoEncontradoException("Usuário não encontrado"));
        usuario.verificar();
        usuarioRepository.save(usuario);
    }

    @Transactional
    public DadosAutenticacao desativarUsuario(String username) {
        var usuario = usuarioRepository.findByEmailIgnoreCaseAndVerificadoTrue(username).orElseThrow();
        usuario.desativar();
        usuarioRepository.save(usuario);
        return usuario;
    }

    @Transactional
    public void salvarGoogleAccessToken(Map<String, Object> oAuth, DadosAutenticacao usuario) {
        usuario.setGoogleAccessToken(oAuth.get("access_token").toString());
        if (oAuth.get("refresh_token") != null) {
            usuario.setGoogleRefreshToken(oAuth.get("refresh_token").toString());
        }
        usuario.setGoogleTokenExpiracao(recuperarExpiracaoAccessToken(oAuth));
        usuarioRepository.save(usuario);
    }

    private LocalDateTime recuperarExpiracaoAccessToken(Map<String, Object> oAuth) {
        if (oAuth.get("expires_in") != null) {
            var expiresIn = (Integer) oAuth.get("expires_in");
            return Utils.converterTimestampParaLocalDateTime(System.currentTimeMillis() + expiresIn * 1000);
        }
        return null;
    }

    public DadosAutenticacao recuperarUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmailIgnoreCaseAndVerificadoTrue(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado ou não verificado"));
    }

    @Transactional
    public void esqueciMinhaSenha(String email) {
        final int MINUTOS_60 = 60;
        var usuario = recuperarUsuarioPorEmail(email);

        usuario.gerarToken(MINUTOS_60);
        usuarioRepository.save(usuario);

        emailService.enviarEmailEsqueciMinhaSenha(email, usuario.getToken());
    }

    @Transactional
    public void alterarSenha(AlteracaoSenhaDto dados, DadosAutenticacao usuario) {
        if (!passwordEncoder.matches(dados.senhaAtual(), usuario.getSenha())) {
            throw new RuntimeException("Senha atual incorreta");
        }

        var novaSenhaCriptografada = passwordEncoder.encode(dados.novaSenha());
        usuario.setSenha(novaSenhaCriptografada);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public DadosAutenticacao redefinirSenha(RedefinicaoSenhaDto dados, String token) {
        var usuario = usuarioRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido ou expirado"));

        if (usuario.getExpiracaoToken() == null || usuario.getExpiracaoToken().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        if (!dados.novaSenha().equals(dados.novaSenhaConfirmacao())) {
            throw new RuntimeException("As senhas não coincidem");
        }

        var novaSenhaCriptografada = passwordEncoder.encode(dados.novaSenha());
        usuario.setSenha(novaSenhaCriptografada);
        usuario.resetarToken();
        usuarioRepository.save(usuario);
        return usuario;
    }
}
