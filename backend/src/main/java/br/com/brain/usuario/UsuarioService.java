package br.com.brain.usuario;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.dadosPessoais.DadosPessoais;
import br.com.brain.perfil.PerfilRepository;
import br.com.brain.usuario.dto.AlteracaoSenhaDto;
import br.com.brain.usuario.dto.ListagemUsuarioDto;
import br.com.brain.usuario.dto.RedefinicaoSenhaDto;
import br.com.brain.enums.PerfilNome;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.email.EmailService;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.utils.DateUtils;
import jakarta.persistence.EntityManager;
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

    /**
     * Cadastra o login usando o e-mail institucional como identificador.
     * Comportamento historico, usado por quem tem vinculo com a escola
     * (aluno e professor recebem emailProfissional na matricula/admissao).
     */
    @Transactional
    public Long cadastrarUsuario(DadosPessoais dadosPessoais, PerfilNome nomePerfil, String senha) {
        return cadastrarUsuario(dadosPessoais, nomePerfil, senha, dadosPessoais.getEmailProfissional());
    }

    /**
     * Cadastra o login com um identificador explicito.
     *
     * Existe para o responsavel, que e externo a escola e por isso nao tem
     * emailProfissional — o login dele e o e-mail pessoal. Sem este overload o
     * username sairia null e o acesso seria impossivel.
     */
    @Transactional
    public Long cadastrarUsuario(DadosPessoais dadosPessoais, PerfilNome nomePerfil, String senha, String login) {
        var senhaCriptografada = passwordEncoder.encode(senha);

        var perfil = perfilRepository.findByNome(nomePerfil);
        var usuario = new DadosAutenticacao(dadosPessoais.getPerfis(), login, senhaCriptografada, perfil);

        usuario.setDadosPessoais(dadosPessoais);
        var usuarioCriado = usuarioRepository.save(usuario);
        String schema = TenantContext.getTenantId();
        // Nem todo perfil tem nome social (o responsavel nao informa) — sem o
        // fallback o e-mail de verificacao chegaria com "Ola, null".
        var nomeParaSaudacao = dadosPessoais.getNomeSocial() != null && !dadosPessoais.getNomeSocial().isBlank()
                ? dadosPessoais.getNomeSocial()
                : dadosPessoais.getNome();
        emailService.enviarEmailVerificacao(nomeParaSaudacao, dadosPessoais.getEmail(), senha, usuario,
                schema);
        return usuarioCriado.getId();
    }

    public Page<ListagemUsuarioDto> listar(Pageable paginacao) {
        return usuarioRepository.findAll(paginacao).map(ListagemUsuarioDto::new);
    }

    @Transactional
    public void excluir(Long id) {
        var usuario = usuarioRepository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Usuario", id));
        usuarioRepository.delete(usuario);
    }

    public DadosAutenticacao recuperarUsuarioPorId(Long id) {
        return usuarioRepository
                .findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Usuario", id));
    }

    public DadosAutenticacao recuperarUsuarioLogado(DadosAutenticacao usuario) {
        if (usuario == null) {
            throw new ErrosSistema.SessaoExpiradaException(
                    "Sua sessão foi expirada! Por favor, faça o login novamente");
        }
        return usuarioRepository
                .findById(usuario.getId())
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Usuario", usuario.getId()));
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
    public DadosAutenticacao reativarUsuario(String username) {
        var usuario = usuarioRepository.findByEmailIgnoreCaseAndVerificadoTrue(username).orElseThrow();
        usuario.reativar();
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
            return DateUtils.timestampToLocalDateTime(System.currentTimeMillis() + expiresIn * 1000);
        }
        return null;
    }

    public DadosAutenticacao recuperarUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmailIgnoreCaseAndVerificadoTrue(email)
                .orElseThrow(() -> new ErrosSistema.RecursoNaoEncontradoException(
                        "Usuário de email " + email + " não encontrado ou não verificado"));
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
            throw new ErrosSistema.SenhaIncorretaException("Senha atual incorreta");
        }

        var novaSenhaCriptografada = passwordEncoder.encode(dados.novaSenha());
        usuario.setSenha(novaSenhaCriptografada);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public DadosAutenticacao redefinirSenha(RedefinicaoSenhaDto dados, String token) {
        var usuario = usuarioRepository.findByToken(token)
                .orElseThrow(() -> new ErrosSistema.TokenInvalidoOuExpiradoException("Token inválido ou expirado"));

        if (usuario.getExpiracaoToken() == null || usuario.getExpiracaoToken().isBefore(LocalDateTime.now())) {
            throw new ErrosSistema.TokenInvalidoOuExpiradoException("Token expirado");
        }

        if (!dados.novaSenha().equals(dados.novaSenhaConfirmacao())) {
            throw new ErrosSistema.SenhaIncorretaException("As senhas não coincidem");
        }

        var novaSenhaCriptografada = passwordEncoder.encode(dados.novaSenha());
        usuario.setSenha(novaSenhaCriptografada);
        usuario.resetarToken();
        usuarioRepository.save(usuario);
        return usuario;
    }
}
