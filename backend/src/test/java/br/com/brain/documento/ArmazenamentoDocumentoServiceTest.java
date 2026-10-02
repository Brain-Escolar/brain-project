package br.com.brain.documento;

import br.com.brain.arquivo.Arquivo;
import br.com.brain.arquivo.ArquivoRepository;
import br.com.brain.exception.ErrosSistema.OperacaoInvalidaException;
import br.com.brain.infra.aws.S3Service;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ArmazenamentoDocumentoService")
class ArmazenamentoDocumentoServiceTest {

    @Mock
    private S3Service s3Service;

    @Mock
    private ArquivoRepository arquivoRepository;

    @InjectMocks
    private ArmazenamentoDocumentoService armazenamento;

    @Test
    @DisplayName("tipo vem dos bytes, nao do content type declarado pelo cliente")
    void detectaPdfPelosBytes() {
        when(arquivoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var pdf = new MockMultipartFile("arquivos", "rg-joao-silva.png", "image/png", "%PDF-1.7 ...".getBytes());

        Arquivo arquivo = armazenamento.salvarDocumento(pdf);

        assertThat(arquivo.getContentType()).isEqualTo("application/pdf");
        verify(s3Service).upload(anyString(), any(byte[].class), eq("application/pdf"));
    }

    @Test
    @DisplayName("chave no S3 nao carrega o nome original do arquivo")
    void chaveSemNomeOriginal() {
        when(arquivoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var pdf = new MockMultipartFile("arquivos", "rg-joao-silva.pdf", "application/pdf", "%PDF-1.7".getBytes());

        Arquivo arquivo = armazenamento.salvarDocumento(pdf);

        assertThat(arquivo.getS3Key()).startsWith("documentos/").doesNotContain("joao");
        assertThat(arquivo.getNomeOriginal()).isEqualTo("rg-joao-silva.pdf");
    }

    @Test
    @DisplayName("rejeita arquivo que nao e PDF/JPG/PNG, mesmo com extensao valida")
    void rejeitaExecutavelDisfarcado() {
        var exe = new MockMultipartFile("arquivos", "rg.pdf", "application/pdf", "MZ\u0090\u0000".getBytes());

        assertThatThrownBy(() -> armazenamento.salvarDocumento(exe))
                .isInstanceOf(OperacaoInvalidaException.class);
        verify(s3Service, never()).upload(anyString(), any(byte[].class), anyString());
    }

    @Test
    @DisplayName("rejeita arquivo vazio")
    void rejeitaVazio() {
        var vazio = new MockMultipartFile("arquivos", "rg.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> armazenamento.salvarDocumento(vazio))
                .isInstanceOf(OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("foto nao aceita PDF")
    void fotoNaoAceitaPdf() {
        var pdf = new MockMultipartFile("foto", "foto.pdf", "application/pdf", "%PDF-1.7".getBytes());

        assertThatThrownBy(() -> armazenamento.salvarFoto(pdf))
                .isInstanceOf(OperacaoInvalidaException.class);
    }

    @Test
    @DisplayName("foto e reduzida e gravada como JPEG")
    void fotoReduzidaParaJpeg() throws IOException {
        when(arquivoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var png = new MockMultipartFile("foto", "foto.png", "image/png", imagemPng(2000, 1000));

        Arquivo arquivo = armazenamento.salvarFoto(png);

        var bytes = ArgumentCaptor.forClass(byte[].class);
        verify(s3Service).upload(anyString(), bytes.capture(), eq("image/jpeg"));
        var gravada = ImageIO.read(new ByteArrayInputStream(bytes.getValue()));
        assertThat(gravada.getWidth()).isEqualTo(800);
        assertThat(gravada.getHeight()).isEqualTo(400);
        assertThat(arquivo.getS3Key()).startsWith("fotos/").endsWith(".jpg");
    }

    private static byte[] imagemPng(int largura, int altura) throws IOException {
        var imagem = new BufferedImage(largura, altura, BufferedImage.TYPE_INT_ARGB);
        var saida = new ByteArrayOutputStream();
        ImageIO.write(imagem, "png", saida);
        return saida.toByteArray();
    }
}
