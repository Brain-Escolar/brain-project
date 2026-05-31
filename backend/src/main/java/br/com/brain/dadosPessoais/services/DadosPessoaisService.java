package br.com.brain.dadosPessoais.services;

import java.util.Optional;

import org.springframework.stereotype.Service;

import br.com.brain.dadosPessoais.models.DadosPessoais;
import br.com.brain.dadosPessoais.repository.DadosPessoaisRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DadosPessoaisService {

    private final DadosPessoaisRepository dadosPessoaisRepository;

    public Optional<DadosPessoais> buscarDadosPessoaisPorCpf(String cpf) {
        return dadosPessoaisRepository.findByCpf(cpf);
    }

    public DadosPessoais salvar(DadosPessoais dadosPessoais) {
        return dadosPessoaisRepository.save(dadosPessoais);
    }
}
