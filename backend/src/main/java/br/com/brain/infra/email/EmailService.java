package br.com.brain.infra.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import br.com.brain.autenticacao.DadosAutenticacao;

@Service
public class EmailService {

    private final JavaMailSender enviadorEmail;
    private static final String EMAIL_ORIGEM = "brainescolar@gmail.com";
    private static final String NOME_ENVIADOR = "Brain";

    @Value("${site.url}")
    private String urlSite;

    public EmailService(JavaMailSender enviadorEmail) {
        this.enviadorEmail = enviadorEmail;
    }

    private void enviarEmail(String emailUsuario, String assunto, String conteudo) {
        MimeMessage message = enviadorEmail.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        try {
            helper.setFrom(EMAIL_ORIGEM, NOME_ENVIADOR);
            helper.setTo(emailUsuario);
            helper.setSubject(assunto);
            helper.setText(conteudo, true);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Erro ao enviar email");
        }

        enviadorEmail.send(message);
    }

    @Async
    public void enviarEmailVerificacao(String nome, String email, String senha, DadosAutenticacao usuario, String schema) {
        String assunto = "Aqui está seu link para verificar o email";
        String conteudo = gerarConteudoEmail(
                "Olá [[name]],<br>"
                        + "Sua conta escolar foi criada. Seguem as informações abaixo.<br>"
                        + "Login: [[login]] <br>"
                        + "Senha: [[senha]] <br>"
                        + "Por favor clique no link abaixo para verificar sua conta:<br>"
                        + "<h3><a href=\"[[URL]]\" target=\"_self\">VERIFICAR</a></h3>"
                        + "Recomendamos que após clicar no link, voce altere sua senha.<br>"
                        + "Obrigado,<br>"
                        + "Brain.",
                nome,
                usuario.getUsername(),
                senha,
                urlSite + "/usuario/verificar-conta?codigo=" + usuario.getToken() + "&schema=" + schema);

        enviarEmail(email, assunto, conteudo);
    }

    private String gerarConteudoEmail(
            String template, String nome, String login, String senha, String url) {
        return template
                .replace("[[name]]", nome)
                .replace("[[URL]]", url)
                .replace("[[login]]", login)
                .replace("[[senha]]", senha);
    }

    /**
     * Link para a página pública de nova senha (D48). Definir é o primeiro
     * acesso de quem ainda não verificou o e-mail; redefinir é para quem já
     * entrava. O token leva a escola, então o link funciona sem mais nada.
     */
    @Async
    public void enviarEmailLinkSenha(String nome, String email, String login, String token, boolean primeiroAcesso,
            String validade) {
        var link = urlSite + "/nova-senha?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
        var assunto = primeiroAcesso ? "Defina sua senha de acesso ao Brain" : "Redefinição de senha do Brain";
        var abertura = primeiroAcesso
                ? "Seu acesso ao Brain está pronto. Para entrar pela primeira vez, defina sua senha."
                : "Recebemos um pedido para redefinir a sua senha do Brain.";
        var conteudo = "Olá, " + HtmlUtils.htmlEscape(nome) + ".<br><br>"
                + abertura + "<br>"
                + "Seu login é <b>" + HtmlUtils.htmlEscape(login) + "</b>.<br>"
                + "<h3><a href=\"" + link + "\" target=\"_self\">"
                + (primeiroAcesso ? "DEFINIR SENHA" : "REDEFINIR SENHA") + "</a></h3>"
                + "O link vale por " + validade + " e só pode ser usado uma vez.<br>"
                + "Se você não esperava este e-mail, pode ignorá-lo: sua senha não muda.<br><br>"
                + "Brain.";
        enviarEmail(email, assunto, conteudo);
    }
}
