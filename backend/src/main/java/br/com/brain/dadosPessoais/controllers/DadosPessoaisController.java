package br.com.brain.dadosPessoais.controllers;

import br.com.brain.dadosPessoais.domain.DadosPessoais;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import br.com.brain.dadosPessoais.services.DadosPessoaisService;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("dados-pessoais")
@RequiredArgsConstructor
public class DadosPessoaisController {

    private final DadosPessoaisService service;

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<DadosPessoais> buscarPorCpf(@PathVariable("cpf") String cpf) {
        var dadosPessoais = service.buscarDadosPessoaisPorCpf(cpf);
        return ResponseEntity.ok(dadosPessoais.orElseThrow(() -> new EntityNotFoundException("Dados pessoais não encontrados")));
    }

}
