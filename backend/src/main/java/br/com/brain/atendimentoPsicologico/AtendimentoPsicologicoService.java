package br.com.brain.atendimentoPsicologico;

import java.time.Duration;
import java.util.List;

import br.com.brain.aluno.AlunoRepository;
import br.com.brain.arquivo.Arquivo;
import br.com.brain.atendimentoPsicologico.dto.CadastroAtendimentoPsicologicoDto;
import br.com.brain.atendimentoPsicologico.dto.ListagemAtendimentoPsicologicoDto;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.infra.aws.S3Service;
import br.com.brain.laudoMedico.LaudoMedico;
import br.com.brain.laudoMedico.LaudoMedicoRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AtendimentoPsicologicoService {

    private final AtendimentoPsicologicoRepository repository;
    private final AlunoRepository alunoRepository;
    private final LaudoMedicoRepository laudoMedicoRepository;
    private final S3Service s3Service;

    public List<ListagemAtendimentoPsicologicoDto> listarPorAluno(Long alunoId) {
        if (!alunoRepository.existsById(alunoId)) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId);
        }

        return repository.findByAlunoIdOrderByDataDescIdDesc(alunoId).stream()
                .map(atendimento -> new ListagemAtendimentoPsicologicoDto(
                        atendimento,
                        atendimento.getLaudo() != null ? urlDownload(atendimento.getLaudo().getArquivo()) : null))
                .toList();
    }

    @Transactional
    public ListagemAtendimentoPsicologicoDto registrar(Long alunoId, CadastroAtendimentoPsicologicoDto dados) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));

        var atendimento = new AtendimentoPsicologico();
        atendimento.setAluno(aluno);
        atendimento.setData(dados.data());
        atendimento.setProfissional(dados.profissional());
        atendimento.setDescricao(dados.descricao());

        if (dados.laudoId() != null) {
            atendimento.setLaudo(buscarLaudoDoAluno(dados.laudoId(), aluno.getDadosPessoais().getId()));
        }

        repository.save(atendimento);

        return new ListagemAtendimentoPsicologicoDto(
                atendimento,
                atendimento.getLaudo() != null ? urlDownload(atendimento.getLaudo().getArquivo()) : null);
    }

    /**
     * Só aceita laudo da ficha médica do próprio aluno — sem isso um id de outro
     * aluno vincularia um documento alheio ao atendimento.
     */
    private LaudoMedico buscarLaudoDoAluno(Long laudoId, Long dadosPessoaisId) {
        var laudo = laudoMedicoRepository.findById(laudoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("LaudoMedico", laudoId));

        var donoDoLaudo = laudo.getFichaMedica().getDadosPessoais().getId();
        if (!donoDoLaudo.equals(dadosPessoaisId)) {
            throw ErrosSistema.OperacaoInvalidaException.com(
                    "O laudo informado não pertence à ficha médica deste aluno.");
        }

        return laudo;
    }

    private String urlDownload(Arquivo arquivo) {
        if (arquivo == null) {
            return null;
        }
        return s3Service.generatePresignedDownloadUrl(arquivo.getS3Key(), Duration.ofMinutes(5));
    }
}
