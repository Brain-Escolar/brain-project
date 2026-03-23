package br.com.brain.service;

import org.springframework.stereotype.Service;

import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.dependente.Dependente;
import br.com.brain.domain.dependente.DependenteRepository;
import br.com.brain.dto.dependente.CadastroDependenteDto;
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
