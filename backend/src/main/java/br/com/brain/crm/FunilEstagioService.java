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

        var ordemAtual = estagio.getOrdem();
        estagio.setOrdem(vizinho.get().getOrdem());
        vizinho.get().setOrdem(ordemAtual);
        repository.save(estagio);
        repository.save(vizinho.get());
    }
}
