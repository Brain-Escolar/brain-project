package br.com.brain.planejamentoAnual.services;

import br.com.brain.shared.arquivo.Arquivo;
import br.com.brain.shared.arquivo.ArquivoRepository;
import br.com.brain.planejamentoAnual.domain.PlanejamentoAnual;
import br.com.brain.planejamentoAnual.domain.PlanejamentoAnualRepository;
import br.com.brain.shared.arquivo.ListagemArquivoDto;
import br.com.brain.planejamentoAnual.dtos.CadastroPlanejamentoAnualDto;
import br.com.brain.planejamentoAnual.dtos.ListagemPlanejamentoAnualDto;
import br.com.brain.shared.exception.ErrosSistema;
import br.com.brain.shared.infra.s3.S3Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PlanejamentoAnualService {

    private final S3Service s3Service;
    private final PlanejamentoAnualRepository repository;
    private final ArquivoRepository arquivoRepository;

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public PlanejamentoAnual cadastrarPlanejamentoAnual(CadastroPlanejamentoAnualDto dados,
            MultipartFile planejamento) {

        var arquivo = new Arquivo();
        String key = "planejamentos-anuais/" + UUID.randomUUID() + "-" + planejamento.getOriginalFilename();
        s3Service.upload(key, planejamento);
        arquivo.setS3Key(key);
        arquivo.setNomeOriginal(planejamento.getOriginalFilename());
        arquivo.setContentType(planejamento.getContentType());
        arquivo.setTamanho(planejamento.getSize());
        arquivoRepository.save(arquivo);

        var planejamentoAnual = new PlanejamentoAnual();
        planejamentoAnual.setArquivo(arquivo);
        planejamentoAnual.setAno(dados.ano());
        repository.save(planejamentoAnual);
        return planejamentoAnual;
    }

    public Page<ListagemPlanejamentoAnualDto> listarPlanjemento(Pageable paginacao) {
        return repository.findAll(paginacao).map(planejamento -> {
            String downloadUrl = s3Service.generatePresignedDownloadUrl(planejamento.getArquivo().getS3Key(),
                    Duration.ofMinutes(5));
            return new ListagemPlanejamentoAnualDto(planejamento, downloadUrl);
        });
    }

    public ListagemArquivoDto recuperarPlanejamentoAnual(Integer ano) {
        var planejamentoAnual = repository.findByAno(ano)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para(
                        "Planejamento anual", ano));
        String downloadUrl = s3Service.generatePresignedDownloadUrl(planejamentoAnual.getArquivo().getS3Key(),
                Duration.ofMinutes(5));
        return new ListagemArquivoDto(planejamentoAnual.getArquivo(), downloadUrl);
    }
}
