package br.com.brain.crm;

import br.com.brain.crm.dto.AtualizacaoFunilEstagioDto;
import br.com.brain.crm.dto.CadastroFunilEstagioDto;
import br.com.brain.crm.dto.MoverFunilEstagioDto;
import br.com.brain.exception.ErrosSistema;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FunilEstagioService {

    private final FunilEstagioRepository repository;
    private final ProcessoMatriculaRepository processoMatriculaRepository;
    private final HistoricoEstagioRepository historicoEstagioRepository;

    public List<FunilEstagio> listar() {
        return repository.findAllByOrderByOrdemAsc();
    }

    public FunilEstagio detalhar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> ErrosSistema.RecursoNaoEncontradoException.para("Estágio do funil", id));
    }

    @Transactional
    public FunilEstagio cadastrar(CadastroFunilEstagioDto dados) {
        var estagio = new FunilEstagio();
        estagio.setNome(dados.nome());
        estagio.setOrdem(dados.ordem());
        estagio.setSlaDias(dados.slaDias());
        return repository.save(estagio);
    }

    @Transactional
    public FunilEstagio atualizar(Long id, AtualizacaoFunilEstagioDto dados) {
        var estagio = detalhar(id);
        if (dados.nome() != null) {
            estagio.setNome(dados.nome());
        }
        if (dados.slaDias() != null) {
            estagio.setSlaDias(dados.slaDias());
        }
        return repository.save(estagio);
    }

    @Transactional
    public void mover(Long id, MoverFunilEstagioDto direcao) {
        var estagio = detalhar(id);
        var vizinho = direcao == MoverFunilEstagioDto.CIMA
                ? repository.findByOrdem(estagio.getOrdem() - 1)
                : repository.findByOrdem(estagio.getOrdem() + 1);

        if (vizinho.isEmpty()) {
            throw ErrosSistema.OperacaoInvalidaException.com("Não há estágio vizinho nessa direção.");
        }

        var ordemEstagio = estagio.getOrdem();
        var ordemVizinho = vizinho.get().getOrdem();

        // A coluna "ordem" possui constraint de unicidade, então a troca precisa passar por um
        // valor temporário (fora da faixa usada) com flush intermediário para não colidir no banco.
        estagio.setOrdem(-1);
        repository.saveAndFlush(estagio);

        vizinho.get().setOrdem(ordemEstagio);
        repository.saveAndFlush(vizinho.get());

        estagio.setOrdem(ordemVizinho);
        repository.save(estagio);
    }

    @Transactional
    public void excluir(Long id) {
        var estagio = detalhar(id);

        if (processoMatriculaRepository.existsByEstagioAtualId(id)) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Não é possível excluir um estágio que possui processos de matrícula nele.");
        }
        if (historicoEstagioRepository.existsByEstagioId(id)) {
            throw ErrosSistema.OperacaoInvalidaException
                    .com("Não é possível excluir um estágio que já possui histórico registrado.");
        }

        repository.delete(estagio);
        repository.flush();

        // Fecha o "buraco" deixado na sequência de ordem, já que mover() e a criação de novos
        // estágios dependem de uma sequência contígua a partir de 1.
        var restantes = repository.findAllByOrderByOrdemAsc();
        for (int i = 0; i < restantes.size(); i++) {
            var atual = restantes.get(i);
            var novaOrdem = i + 1;
            if (!atual.getOrdem().equals(novaOrdem)) {
                atual.setOrdem(novaOrdem);
                repository.saveAndFlush(atual);
            }
        }
    }
}
