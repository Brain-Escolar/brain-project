package br.com.brain.dependente.services;

import org.springframework.stereotype.Service;

import br.com.brain.dadosPessoais.models.DadosPessoais;
import br.com.brain.dependente.models.Dependente;
import br.com.brain.dependente.repository.DependenteRepository;
import br.com.brain.dependente.dto.CadastroDependenteDto;
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
