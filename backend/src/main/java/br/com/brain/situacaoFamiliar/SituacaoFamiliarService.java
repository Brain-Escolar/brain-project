package br.com.brain.situacaoFamiliar;

import java.util.List;

import br.com.brain.aluno.AlunoRepository;
import br.com.brain.exception.ErrosSistema;
import br.com.brain.situacaoFamiliar.dto.AtualizacaoSituacaoFamiliarDto;
import br.com.brain.situacaoFamiliar.dto.DetalhamentoSituacaoFamiliarDto;
import br.com.brain.situacaoFamiliar.dto.SituacaoFamiliarOpcaoDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SituacaoFamiliarService {

    private final SituacaoFamiliarRepository repository;
    private final SituacaoFamiliarOpcaoRepository opcaoRepository;
    private final AlunoRepository alunoRepository;

    /**
     * Aluno sem registro ainda devolve uma situação vazia com o catálogo — a aba
     * abre pronta para preencher em vez de dar 404.
     */
    public DetalhamentoSituacaoFamiliarDto buscarPorAluno(Long alunoId) {
        if (!alunoRepository.existsById(alunoId)) {
            throw ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId);
        }

        return repository.findByAlunoId(alunoId)
                .map(this::montarDetalhamento)
                .orElseGet(() -> new DetalhamentoSituacaoFamiliarDto(null, null, List.of(), opcoesDisponiveis()));
    }

    @Transactional
    public DetalhamentoSituacaoFamiliarDto salvar(Long alunoId, AtualizacaoSituacaoFamiliarDto dados) {
        var aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Aluno", alunoId));

        var situacao = repository.findByAlunoId(alunoId).orElseGet(() -> {
            var nova = new SituacaoFamiliar();
            nova.setAluno(aluno);
            return nova;
        });

        if (dados.descricao() != null) {
            situacao.setDescricao(dados.descricao());
        }

        if (dados.opcoesMarcadas() != null) {
            var opcoes = opcaoRepository.findAllById(dados.opcoesMarcadas());
            if (opcoes.size() != dados.opcoesMarcadas().stream().distinct().count()) {
                throw ErrosSistema.OperacaoInvalidaException.com(
                        "Uma ou mais opções de situação familiar informadas não existem.");
            }
            situacao.getOpcoes().clear();
            situacao.getOpcoes().addAll(opcoes);
        }

        repository.save(situacao);

        return montarDetalhamento(situacao);
    }

    /** Catálogo ativo — também serve de base para os filtros de relatório. */
    public List<SituacaoFamiliarOpcaoDto> opcoesDisponiveis() {
        return opcaoRepository.findByAtivoTrueOrderByOrdemAsc().stream()
                .map(SituacaoFamiliarOpcaoDto::new)
                .toList();
    }

    private DetalhamentoSituacaoFamiliarDto montarDetalhamento(SituacaoFamiliar situacao) {
        return new DetalhamentoSituacaoFamiliarDto(
                situacao.getId(),
                situacao.getDescricao(),
                situacao.getOpcoes().stream().map(SituacaoFamiliarOpcao::getId).toList(),
                opcoesDisponiveis());
    }
}
