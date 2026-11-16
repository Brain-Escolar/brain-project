package br.com.brain.usuario;

import br.com.brain.autenticacao.DadosAutenticacao;
import br.com.brain.autenticacao.DadosAutenticacaoRepository;
import br.com.brain.autenticacao.TokenService;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.email.EmailService;
import br.com.brain.infra.multitenancy.TenantContext;
import br.com.brain.usuario.dto.InformacaoLinkSenhaDto;
import br.com.brain.usuario.dto.NovaSenhaDto;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Link de definir ou redefinir senha (docs/permissoes.md, D48).
 *
 * - DEFINIR: primeiro acesso de quem ainda não verificou o e-mail. Definir a
 *   senha também verifica o login, porque prova que a pessoa recebe o e-mail.
 *   Substitui o reenvio do e-mail de verificação, que exigia a senha inicial em
 *   texto puro, que não é guardada.
 * - REDEFINIR: "Esqueci a senha" e o envio pela tela de Usuários.
 *
 * O e-mail vai sempre para o e-mail pessoal do cadastro (dados_pessoais.email),
 * e não para o login, que é sintético em cadastros antigos. A escola e o login
 * vão no token assinado; o banco guarda só o código de uso único, que se apaga
 * quando a senha é trocada ou o login é desativado. Um link novo invalida o
 * anterior.
 */
@Service
@RequiredArgsConstructor
public class LinkDeSenhaService {

    static final Duration VALIDADE_DEFINIR = Duration.ofHours(72);
    static final Duration VALIDADE_REDEFINIR = Duration.ofMinutes(60);
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    private final DadosAutenticacaoRepository usuarioRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public enum Finalidade {
        DEFINIR, REDEFINIR
    }

    /** O e-mail pessoal, se houver. Sem ele não há para onde mandar o link. */
    public static String emailPessoal(DadosAutenticacao login) {
        var pessoa = login.getDadosPessoais();
        var email = pessoa == null ? null : pessoa.getEmail();
        return email == null || email.isBlank() ? null : email.trim();
    }

    /** Gera o link e manda para o e-mail pessoal. Quem chama já validou o e-mail e a situação do login. */
    @Transactional
    public void enviar(DadosAutenticacao login, Finalidade finalidade) {
        var destino = emailPessoal(login);
        if (destino == null) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "A pessoa não tem e-mail pessoal no cadastro. Cadastre um e-mail na tela de origem dela antes de enviar o link.");
        }
        var validade = finalidade == Finalidade.DEFINIR ? VALIDADE_DEFINIR : VALIDADE_REDEFINIR;
        var expiracao = Instant.now().plus(validade);
        var codigo = UUID.randomUUID().toString();
        login.gerarTokenSenha(codigo, LocalDateTime.ofInstant(expiracao, FUSO));
        usuarioRepository.save(login);

        var token = tokenService.gerarTokenSenha(login.getId(), TenantContext.getTenantId(), codigo,
                finalidade.name(), expiracao);
        emailService.enviarEmailLinkSenha(nome(login), destino, login.getEmail(), token,
                finalidade == Finalidade.DEFINIR, descrever(validade));
    }

    /**
     * Aponta a requisição para a escola do token. Fica fora de transação e é
     * chamado pelo controller antes dos outros métodos, porque o schema é
     * aplicado quando a conexão é aberta, no começo da transação.
     */
    public void aplicarEscola(String token) {
        TenantContext.setTenantId(tokenService.lerTokenSenha(token).tenantId());
    }

    /** Para a página pública saber o que mostrar antes de a pessoa digitar a senha. */
    @Transactional(readOnly = true)
    public InformacaoLinkSenhaDto informacao(String token) {
        var login = validar(token);
        var finalidade = Finalidade.valueOf(tokenService.lerTokenSenha(token).finalidade());
        return new InformacaoLinkSenhaDto(finalidade, nome(login), login.getEmail());
    }

    @Transactional
    public void definirSenha(NovaSenhaDto dados) {
        if (!dados.novaSenha().equals(dados.novaSenhaConfirmacao())) {
            throw new ErrosSistema.SenhaIncorretaException("As senhas não coincidem.");
        }
        var login = validar(dados.token());
        var finalidade = Finalidade.valueOf(tokenService.lerTokenSenha(dados.token()).finalidade());

        login.setSenha(passwordEncoder.encode(dados.novaSenha()));
        login.resetarTokenSenha();
        if (finalidade == Finalidade.DEFINIR && !Boolean.TRUE.equals(login.getVerificado())) {
            login.verificar();
        }
        usuarioRepository.save(login);
    }

    /** Confere assinatura, escola, código de uso único, validade e situação do login. */
    private DadosAutenticacao validar(String token) {
        var dados = tokenService.lerTokenSenha(token);
        var login = usuarioRepository.findById(dados.loginId()).orElse(null);
        var valido = login != null
                && dados.codigo() != null
                && dados.codigo().equals(login.getTokenSenha())
                && login.getExpiracaoTokenSenha() != null
                && login.getExpiracaoTokenSenha().isAfter(LocalDateTime.now(FUSO))
                && login.getMotivoDesativacao() == null
                && dados.tenantId() != null && dados.tenantId().equals(TenantContext.getTenantId());
        if (!valido) {
            throw new ErrosSistema.TokenInvalidoOuExpiradoException("Este link é inválido ou expirou. Peça um novo.");
        }
        return login;
    }

    private static String nome(DadosAutenticacao login) {
        var pessoa = login.getDadosPessoais();
        if (pessoa == null) {
            return "";
        }
        var social = pessoa.getNomeSocial();
        return social != null && !social.isBlank() ? social : pessoa.getNome();
    }

    private static String descrever(Duration validade) {
        return validade.toHours() >= 1 && validade.toMinutes() % 60 == 0
                ? (validade.toHours() == 1 ? "1 hora" : validade.toHours() + " horas")
                : validade.toMinutes() + " minutos";
    }
}
