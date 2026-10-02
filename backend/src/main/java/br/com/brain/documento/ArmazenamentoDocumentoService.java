package br.com.brain.documento;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.ArquivoRepository;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.exception.ErrosSistema.StorageException;
import br.com.brain.infra.aws.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

/**
 * Grava no S3 os arquivos de documentos e fotos de pessoas.
 *
 * Sao dados pessoais, muitas vezes de menores, entao:
 * - o tipo e decidido pelos primeiros bytes do arquivo, nunca pela extensao
 *   ou pelo content type que o cliente declarou;
 * - a chave no S3 e so um UUID - nada de nome de arquivo, que costuma trazer
 *   nome ou CPF ("rg-joao-silva.pdf");
 * - a foto e re-encodada: reduz o tamanho e descarta o EXIF (que pode trazer a
 *   localizacao GPS de onde a foto foi tirada).
 */
@Service
@RequiredArgsConstructor
public class ArmazenamentoDocumentoService {

    static final long TAMANHO_MAX_DOCUMENTO = 10L * 1024 * 1024;
    static final long TAMANHO_MAX_FOTO = 10L * 1024 * 1024;
    private static final int LADO_MAX_FOTO = 800;

    private final S3Service s3Service;
    private final ArquivoRepository arquivoRepository;

    public Arquivo salvarDocumento(MultipartFile enviado) {
        var conteudo = ler(enviado, TAMANHO_MAX_DOCUMENTO);
        var formato = FormatoArquivo.detectar(conteudo);
        if (formato == null) {
            throw OperacaoInvalidaException.com("Formato não aceito. Envie PDF, JPG ou PNG.");
        }
        var key = "documentos/" + UUID.randomUUID() + formato.extensao;
        s3Service.upload(key, conteudo, formato.contentType);
        return registrar(key, enviado.getOriginalFilename(), formato.contentType, conteudo.length);
    }

    public Arquivo salvarFoto(MultipartFile enviado) {
        var conteudo = ler(enviado, TAMANHO_MAX_FOTO);
        var formato = FormatoArquivo.detectar(conteudo);
        if (formato != FormatoArquivo.JPEG && formato != FormatoArquivo.PNG) {
            throw OperacaoInvalidaException.com("Formato não aceito para foto. Envie JPG ou PNG.");
        }
        var jpeg = reencodarFoto(conteudo);
        var key = "fotos/" + UUID.randomUUID() + ".jpg";
        s3Service.upload(key, jpeg, FormatoArquivo.JPEG.contentType);
        return registrar(key, enviado.getOriginalFilename(), FormatoArquivo.JPEG.contentType, jpeg.length);
    }

    private Arquivo registrar(String key, String nomeOriginal, String contentType, long tamanho) {
        var arquivo = new Arquivo();
        arquivo.setS3Key(key);
        arquivo.setNomeOriginal(nomeOriginal);
        arquivo.setContentType(contentType);
        arquivo.setTamanho(tamanho);
        return arquivoRepository.save(arquivo);
    }

    private byte[] ler(MultipartFile enviado, long tamanhoMax) {
        if (enviado == null || enviado.isEmpty()) {
            throw OperacaoInvalidaException.com("Arquivo vazio.");
        }
        if (enviado.getSize() > tamanhoMax) {
            throw OperacaoInvalidaException.com(
                    "Arquivo maior que o permitido (%d MB).".formatted(tamanhoMax / (1024 * 1024)));
        }
        try {
            return enviado.getBytes();
        } catch (IOException e) {
            throw new StorageException("Erro ao ler o arquivo enviado", e);
        }
    }

    static byte[] reencodarFoto(byte[] original) {
        try {
            var imagem = ImageIO.read(new ByteArrayInputStream(original));
            if (imagem == null) {
                throw OperacaoInvalidaException.com("Não foi possível ler a imagem enviada.");
            }
            double escala = Math.min(1.0,
                    (double) LADO_MAX_FOTO / Math.max(imagem.getWidth(), imagem.getHeight()));
            int largura = Math.max(1, (int) Math.round(imagem.getWidth() * escala));
            int altura = Math.max(1, (int) Math.round(imagem.getHeight() * escala));

            // TYPE_INT_RGB com fundo branco: JPEG nao tem canal alfa (PNG transparente).
            var destino = new BufferedImage(largura, altura, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = destino.createGraphics();
            try {
                g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g.setColor(Color.WHITE);
                g.fillRect(0, 0, largura, altura);
                g.drawImage(imagem, 0, 0, largura, altura, null);
            } finally {
                g.dispose();
            }

            var saida = new ByteArrayOutputStream();
            ImageIO.write(destino, "jpg", saida);
            return saida.toByteArray();
        } catch (IOException e) {
            throw OperacaoInvalidaException.com("Não foi possível ler a imagem enviada.");
        }
    }

    enum FormatoArquivo {
        PDF("application/pdf", ".pdf", new int[] { 0x25, 0x50, 0x44, 0x46 }),
        JPEG("image/jpeg", ".jpg", new int[] { 0xFF, 0xD8, 0xFF }),
        PNG("image/png", ".png", new int[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A });

        final String contentType;
        final String extensao;
        private final int[] assinatura;

        FormatoArquivo(String contentType, String extensao, int[] assinatura) {
            this.contentType = contentType;
            this.extensao = extensao;
            this.assinatura = assinatura;
        }

        static FormatoArquivo detectar(byte[] conteudo) {
            for (var formato : values()) {
                if (formato.confere(conteudo)) {
                    return formato;
                }
            }
            return null;
        }

        private boolean confere(byte[] conteudo) {
            if (conteudo.length < assinatura.length) {
                return false;
            }
            for (int i = 0; i < assinatura.length; i++) {
                if ((conteudo[i] & 0xFF) != assinatura[i]) {
                    return false;
                }
            }
            return true;
        }
    }
}
