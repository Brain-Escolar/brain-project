package br.com.brain.infra.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import br.com.brain.domain.autenticacao.DadosAutenticacao;

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
    public void enviarEmailVerificacao(String nome, String email, String senha, DadosAutenticacao usuario) {
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
                urlSite + "/usuario/verificar-conta?codigo=" + usuario.getToken());

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

    public void enviarEmailEsqueciMinhaSenha(String email, String token) {
        String assunto = "Redefinição de senha";
        String conteudo = "Olá,<br>" +
                "Para redefinir sua senha, clique no link abaixo:<br>" +
                "<h3><a href=\"" + urlSite + "/usuario/alterar-senha?codigo=" + token
                + "\" target=\"_self\">ALTERAR SENHA</a></h3>";
        enviarEmail(email, assunto, conteudo);
    }
}
