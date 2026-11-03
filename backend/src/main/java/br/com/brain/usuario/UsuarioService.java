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
     * Cadastra o login de qualquer perfil usando o e-mail cadastrado em
     * dados_pessoais como identificador. A senha inicial e o link de ativacao
     * vao para esse mesmo e-mail; a conta so fica ativa apos a confirmacao.
     */
    @Transactional
    public Long cadastrarUsuario(DadosPessoais dadosPessoais, PerfilNome nomePerfil, String senha) {
        var login = dadosPessoais.getEmail();
        if (login == null || login.isBlank()) {
            // Sem e-mail nao ha login nem para onde mandar a ativacao.
            throw ErrosSistema.OperacaoInvalidaException
                    .com("É necessário informar um e-mail no cadastro para gerar o acesso.");
        }

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

    /**
     * Da o perfil a pessoa, criando o login so se ela ainda nao tiver um.
     *
     * Quem ja entra no sistema por outro papel (o professor que agora tambem
     * e responsavel) ganha so o perfil no mesmo login: nao recebe outra
     * senha nem outro e-mail de verificacao, e escolhe o papel no seletor de
     * perfil do frontend. A senha so e usada quando o login e criado.
     */
    @Transactional
    public void concederPerfil(DadosPessoais dadosPessoais, PerfilNome nomePerfil, String senhaInicial) {
        var login = dadosPessoais.getId() == null ? null
                : usuarioRepository.findByDadosPessoaisId(dadosPessoais.getId()).orElse(null);
        if (login == null) {
            cadastrarUsuario(dadosPessoais, nomePerfil, senhaInicial);
            return;
        }

        var jaTemPerfil = dadosPessoais.getPerfis().stream()
                .anyMatch(perfil -> nomePerfil.equals(perfil.getNome()));
        if (!jaTemPerfil) {
            dadosPessoais.getPerfis().add(perfilRepository.findByNome(nomePerfil));
            em.merge(dadosPessoais);
        }
        // Login desligado por revogarPerfil (ficou sem papel) volta com o papel.
        // Nao verificado continua inativo: quem ativa e o link do e-mail.
        if (Boolean.TRUE.equals(login.getVerificado()) && !Boolean.TRUE.equals(login.getAtivo())) {
            login.reativar();
            usuarioRepository.save(login);
        }
    }

    /**
     * Tira um papel da pessoa sem mexer nos outros: o professor desligado que
     * tambem e responsavel continua entrando no portal. So quando nao sobra
     * papel nenhum o login e desativado.
     */
    @Transactional
    public void revogarPerfil(DadosPessoais dadosPessoais, PerfilNome nomePerfil) {
        var removeu = dadosPessoais.getPerfis().removeIf(perfil -> nomePerfil.equals(perfil.getNome()));
        if (removeu) {
            em.merge(dadosPessoais);
        }
        if (dadosPessoais.getPerfis().isEmpty()) {
            usuarioRepository.findByDadosPessoaisId(dadosPessoais.getId()).ifPresent(login -> {
                login.desativar();
                usuarioRepository.save(login);
            });
        }
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
