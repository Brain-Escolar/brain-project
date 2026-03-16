package br.com.brain.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import br.com.brain.domain.dadosPessoais.DadosPessoais;
import br.com.brain.domain.dadosPessoais.DadosPessoaisRepository;
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
