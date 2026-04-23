package br.com.brain.shared.dependente;

import org.springframework.stereotype.Service;

import br.com.brain.dadosPessoais.domain.DadosPessoais;
import br.com.brain.shared.dependente.Dependente;
import br.com.brain.shared.dependente.DependenteRepository;
import br.com.brain.shared.dependente.CadastroDependenteDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DependenteService {

    private final DependenteRepository dadosPessoaisRepository;

    @PersistenceContext
    private EntityManager em;

    public Dependente cadastrarDependente(Long responsavelId, CadastroDependenteDto dados) {

        DadosPessoais responsavel = em.getReference(DadosPessoais.class, responsavelId);

        Dependente dependente = new Dependente();
        dependente.setNome(dados.nome());
        dependente.setCpf(dados.cpf());
        dependente.setDataDeNascimento(dados.dataDeNascimento());
        dependente.setGrauParentesco(dados.grauParentesco());
        dependente.setPossuiDeficiencia(dados.possuiDeficiencia());
        dependente.setResponsavel(responsavel);
        return dadosPessoaisRepository.save(dependente);
    }

}
